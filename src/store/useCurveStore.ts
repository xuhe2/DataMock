import { create } from "zustand";
import { createGeneratedCurve } from "../core/transforms";
import { demoCurves } from "../data/demoCurves";
import type { Curve, TransformDraft } from "../types";

type CurveStore = {
  curves: Curve[];
  selectedCurveIds: string[];
  activeCurveId?: string;
  referenceCurveId?: string;
  transformDrafts: TransformDraft[];
  setCurves: (curves: Curve[]) => void;
  toggleCurveVisible: (curveId: string) => void;
  setActiveCurve: (curveId: string) => void;
  setReferenceCurve: (curveId: string | undefined) => void;
  addTransformDraft: (draft: TransformDraft) => void;
  updateTransformDraft: (id: string, patch: Partial<TransformDraft>) => void;
  removeTransformDraft: (id: string) => void;
  moveTransformDraft: (id: string, direction: "up" | "down") => void;
  clearTransformDrafts: () => void;
  applyTransformPipeline: () => void;
  deleteCurve: (curveId: string) => void;
  exportSelectedCurves: () => void;
};

function prepareImportedCurves(curves: Curve[]): Curve[] {
  return curves.map((curve) => ({
    ...curve,
    meta: {
      ...curve.meta,
      kind: curve.meta?.kind ?? "raw",
      style: {
        lineType: curve.meta?.style?.lineType ?? "solid",
      },
    },
  }));
}

function uniqueIds(curves: Curve[]): string[] {
  return curves.map((curve) => curve.id);
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const initialCurves = prepareImportedCurves(demoCurves);

export const useCurveStore = create<CurveStore>((set, get) => ({
  curves: initialCurves,
  selectedCurveIds: uniqueIds(initialCurves),
  activeCurveId: initialCurves[0]?.id,
  referenceCurveId: initialCurves[1]?.id,
  transformDrafts: [],

  setCurves: (curves) => {
    const nextCurves = prepareImportedCurves(curves);

    set({
      curves: nextCurves,
      selectedCurveIds: uniqueIds(nextCurves),
      activeCurveId: nextCurves[0]?.id,
      referenceCurveId: nextCurves[1]?.id,
      transformDrafts: [],
    });
  },

  toggleCurveVisible: (curveId) => {
    set((state) => {
      const isSelected = state.selectedCurveIds.includes(curveId);

      return {
        selectedCurveIds: isSelected
          ? state.selectedCurveIds.filter((id) => id !== curveId)
          : [...state.selectedCurveIds, curveId],
      };
    });
  },

  setActiveCurve: (curveId) => {
    set({ activeCurveId: curveId });
  },

  setReferenceCurve: (curveId) => {
    set({ referenceCurveId: curveId });
  },

  addTransformDraft: (draft) => {
    set((state) => ({
      transformDrafts: [...state.transformDrafts, draft],
    }));
  },

  updateTransformDraft: (id, patch) => {
    set((state) => ({
      transformDrafts: state.transformDrafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              ...patch,
              params: patch.params ?? draft.params,
            }
          : draft,
      ),
    }));
  },

  removeTransformDraft: (id) => {
    set((state) => ({
      transformDrafts: state.transformDrafts.filter((draft) => draft.id !== id),
    }));
  },

  moveTransformDraft: (id, direction) => {
    set((state) => {
      const index = state.transformDrafts.findIndex((draft) => draft.id === id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= state.transformDrafts.length) {
        return state;
      }

      const nextDrafts = [...state.transformDrafts];
      [nextDrafts[index], nextDrafts[nextIndex]] = [nextDrafts[nextIndex], nextDrafts[index]];

      return {
        transformDrafts: nextDrafts,
      };
    });
  },

  clearTransformDrafts: () => {
    set({ transformDrafts: [] });
  },

  applyTransformPipeline: () => {
    const state = get();
    if (!state.activeCurveId || state.transformDrafts.length === 0) return;

    const sourceCurve = state.curves.find((curve) => curve.id === state.activeCurveId);
    if (!sourceCurve) return;

    const lookupCurve = (curveId: string): Curve | undefined => {
      return state.curves.find((curve) => curve.id === curveId);
    };
    const sourceGeneratedCount = state.curves.filter(
      (curve) => curve.meta?.sourceCurveId === sourceCurve.id,
    ).length;
    const generatedCurve = createGeneratedCurve(
      sourceCurve,
      state.transformDrafts,
      lookupCurve,
      sourceGeneratedCount + 1,
    );

    set({
      curves: [...state.curves, generatedCurve],
      selectedCurveIds: [...state.selectedCurveIds, generatedCurve.id],
      activeCurveId: generatedCurve.id,
    });
  },

  deleteCurve: (curveId) => {
    set((state) => {
      const nextCurves = state.curves.filter((curve) => curve.id !== curveId);
      const fallbackCurveId = nextCurves[0]?.id;

      return {
        curves: nextCurves,
        selectedCurveIds: state.selectedCurveIds.filter((id) => id !== curveId),
        activeCurveId: state.activeCurveId === curveId ? fallbackCurveId : state.activeCurveId,
        referenceCurveId: state.referenceCurveId === curveId ? undefined : state.referenceCurveId,
      };
    });
  },

  exportSelectedCurves: () => {
    const state = get();
    const selectedCurves = state.curves.filter((curve) => state.selectedCurveIds.includes(curve.id));
    downloadJson("selected-curves.json", selectedCurves);
  },
}));
