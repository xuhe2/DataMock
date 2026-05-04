import { create } from "zustand";
import { demoCurves } from "../data/demoCurves";
import type { Curve, MockCurve, Transform, TransformType } from "../types";
import { createMockCurve } from "../core/transforms";

type CurveStore = {
  curves: Curve[];
  mockCurves: MockCurve[];
  selectedCurveIds: string[];
  activeCurveId?: string;
  referenceCurveId?: string;
  transforms: Transform[];
  setCurves: (curves: Curve[]) => void;
  toggleCurveVisible: (curveId: string) => void;
  setActiveCurve: (curveId: string) => void;
  setReferenceCurve: (curveId: string | undefined) => void;
  applyTransform: (type: TransformType, params: Record<string, any>) => void;
  resetMockCurve: () => void;
  clearAllMockCurves: () => void;
  exportMockData: () => void;
};

function uniqueIds(curves: Curve[]): string[] {
  return curves.map((curve) => curve.id);
}

function createTransformId(type: TransformType): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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

export const useCurveStore = create<CurveStore>((set, get) => ({
  curves: demoCurves,
  mockCurves: [],
  selectedCurveIds: uniqueIds(demoCurves),
  activeCurveId: demoCurves[0]?.id,
  referenceCurveId: demoCurves[1]?.id,
  transforms: [],

  setCurves: (curves) => {
    set({
      curves,
      mockCurves: [],
      selectedCurveIds: uniqueIds(curves),
      activeCurveId: curves[0]?.id,
      referenceCurveId: curves[1]?.id,
      transforms: [],
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

  applyTransform: (type, params) => {
    const state = get();
    const activeCurveId = state.activeCurveId;
    if (!activeCurveId) return;

    const sourceCurve = state.curves.find((curve) => curve.id === activeCurveId);
    if (!sourceCurve) return;

    const previousMock = state.mockCurves.find((curve) => curve.sourceCurveId === activeCurveId);
    const transform: Transform = {
      id: createTransformId(type),
      curveId: activeCurveId,
      type,
      params,
    };

    const lookupCurve = (curveId: string): Curve | MockCurve | undefined => {
      return (
        state.curves.find((curve) => curve.id === curveId) ??
        state.mockCurves.find((curve) => curve.id === curveId || curve.sourceCurveId === curveId)
      );
    };

    const nextMock = createMockCurve(
      sourceCurve,
      previousMock ?? sourceCurve,
      previousMock?.transforms ?? [],
      transform,
      lookupCurve,
    );

    const nextMockCurves = [
      ...state.mockCurves.filter((curve) => curve.sourceCurveId !== activeCurveId),
      nextMock,
    ];
    const nextSelectedCurveIds = state.selectedCurveIds.includes(nextMock.id)
      ? state.selectedCurveIds
      : [...state.selectedCurveIds, nextMock.id];

    set({
      mockCurves: nextMockCurves,
      selectedCurveIds: nextSelectedCurveIds,
      transforms: [...state.transforms.filter((item) => item.curveId !== activeCurveId), ...nextMock.transforms],
    });
  },

  resetMockCurve: () => {
    const activeCurveId = get().activeCurveId;
    if (!activeCurveId) return;

    set((state) => {
      const activeMockIds = state.mockCurves
        .filter((curve) => curve.sourceCurveId === activeCurveId)
        .map((curve) => curve.id);

      return {
        mockCurves: state.mockCurves.filter((curve) => curve.sourceCurveId !== activeCurveId),
        selectedCurveIds: state.selectedCurveIds.filter((id) => !activeMockIds.includes(id)),
        transforms: state.transforms.filter((transform) => transform.curveId !== activeCurveId),
      };
    });
  },

  clearAllMockCurves: () => {
    set((state) => {
      const mockIds = state.mockCurves.map((curve) => curve.id);

      return {
        mockCurves: [],
        selectedCurveIds: state.selectedCurveIds.filter((id) => !mockIds.includes(id)),
        transforms: [],
      };
    });
  },

  exportMockData: () => {
    downloadJson("mock-curves.json", get().mockCurves);
  },
}));
