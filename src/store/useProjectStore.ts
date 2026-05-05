import { create } from "zustand";
import { createEmptyProject, createDemoProject, migrateProject } from "../project/migrations";
import type { DataMockProject, Sheet } from "../project/types";
import { createGeneratedCurve } from "../sheets/curve/transforms";
import { ensureUniqueCurves, prepareCurves } from "../sheets/curve/sheet";
import type { Curve, CurveSheet, CurveTransformDraft } from "../sheets/curve/types";
import { createGeneratedScalarMetric } from "../sheets/scalar/transforms";
import { ensureUniqueMetrics, prepareMetrics } from "../sheets/scalar/sheet";
import type { ScalarMetric, ScalarSheet, ScalarTransformDraft } from "../sheets/scalar/types";

type ProjectStore = {
  project: DataMockProject;
  newProject: () => void;
  loadProject: (project: DataMockProject) => void;
  getProjectSnapshot: () => DataMockProject;
  setActiveSheet: (sheetId: string) => void;
  addSheet: (kind: Sheet["kind"]) => void;
  renameSheet: (sheetId: string, name: string) => void;
  deleteSheet: (sheetId: string) => void;
  updateCurveSheet: (sheetId: string, updater: (sheet: CurveSheet) => CurveSheet) => void;
  updateScalarSheet: (sheetId: string, updater: (sheet: ScalarSheet) => ScalarSheet) => void;
  appendCurvesToActiveSheet: (curves: Curve[]) => void;
  appendMetricsToActiveSheet: (metrics: ScalarMetric[]) => void;
  exportSelectedData: () => void;
};

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

function updateSheet(project: DataMockProject, sheetId: string, nextSheet: Sheet): DataMockProject {
  return {
    ...project,
    sheets: project.sheets.map((sheet) => (sheet.id === sheetId ? nextSheet : sheet)),
  };
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: createDemoProject(),

  newProject: () => {
    set({ project: createEmptyProject() });
  },

  loadProject: (project) => {
    set({ project: migrateProject(project) });
  },

  getProjectSnapshot: () => {
    const project = get().project;

    return {
      ...project,
      savedAt: new Date().toISOString(),
    };
  },

  setActiveSheet: (sheetId) => {
    set((state) => ({
      project: {
        ...state.project,
        activeSheetId: sheetId,
      },
    }));
  },

  addSheet: (kind) => {
    set((state) => {
      const sheet = kind === "curve"
        ? ({
            id: `curve_sheet_${Date.now()}`,
            name: "Curves",
            kind: "curve",
            curves: [],
            selectedCurveIds: [],
            transformDrafts: [],
          } satisfies CurveSheet)
        : ({
            id: `scalar_sheet_${Date.now()}`,
            name: "Scalars",
            kind: "scalar",
            metrics: [],
            selectedMetricIds: [],
            transformDrafts: [],
          } satisfies ScalarSheet);

      return {
        project: {
          ...state.project,
          activeSheetId: sheet.id,
          sheets: [...state.project.sheets, sheet],
        },
      };
    });
  },

  renameSheet: (sheetId, name) => {
    const nextName = name.trim();
    if (!nextName) return;

    set((state) => ({
      project: {
        ...state.project,
        sheets: state.project.sheets.map((sheet) =>
          sheet.id === sheetId
            ? {
                ...sheet,
                name: nextName,
              }
            : sheet,
        ),
      },
    }));
  },

  deleteSheet: (sheetId) => {
    set((state) => {
      if (state.project.sheets.length <= 1) return state;

      const sheets = state.project.sheets.filter((sheet) => sheet.id !== sheetId);

      return {
        project: {
          ...state.project,
          sheets,
          activeSheetId: state.project.activeSheetId === sheetId ? sheets[0]?.id : state.project.activeSheetId,
        },
      };
    });
  },

  updateCurveSheet: (sheetId, updater) => {
    set((state) => {
      const sheet = state.project.sheets.find((item) => item.id === sheetId);
      if (!sheet || sheet.kind !== "curve") return state;

      return {
        project: updateSheet(state.project, sheetId, updater(sheet)),
      };
    });
  },

  updateScalarSheet: (sheetId, updater) => {
    set((state) => {
      const sheet = state.project.sheets.find((item) => item.id === sheetId);
      if (!sheet || sheet.kind !== "scalar") return state;

      return {
        project: updateSheet(state.project, sheetId, updater(sheet)),
      };
    });
  },

  appendCurvesToActiveSheet: (curves) => {
    const state = get();
    const activeSheet = state.project.sheets.find((sheet) => sheet.id === state.project.activeSheetId);
    if (!activeSheet || activeSheet.kind !== "curve") return;

    get().updateCurveSheet(activeSheet.id, (sheet) => {
      const nextCurves = prepareCurves(ensureUniqueCurves(curves, sheet.curves.map((curve) => curve.id)));
      const nextCurveIds = nextCurves.map((curve) => curve.id);

      return {
        ...sheet,
        curves: [...sheet.curves, ...nextCurves],
        selectedCurveIds: [...sheet.selectedCurveIds, ...nextCurveIds],
        activeCurveId: nextCurveIds[0] ?? sheet.activeCurveId,
        referenceCurveId: sheet.referenceCurveId ?? nextCurveIds[1] ?? nextCurveIds[0],
      };
    });
  },

  appendMetricsToActiveSheet: (metrics) => {
    const state = get();
    const activeSheet = state.project.sheets.find((sheet) => sheet.id === state.project.activeSheetId);
    if (!activeSheet || activeSheet.kind !== "scalar") return;

    get().updateScalarSheet(activeSheet.id, (sheet) => {
      const nextMetrics = prepareMetrics(ensureUniqueMetrics(metrics, sheet.metrics.map((metric) => metric.id)));
      const nextMetricIds = nextMetrics.map((metric) => metric.id);

      return {
        ...sheet,
        metrics: [...sheet.metrics, ...nextMetrics],
        selectedMetricIds: [...sheet.selectedMetricIds, ...nextMetricIds],
        activeMetricId: nextMetricIds[0] ?? sheet.activeMetricId,
        referenceMetricId: sheet.referenceMetricId ?? nextMetricIds[1] ?? nextMetricIds[0],
      };
    });
  },

  exportSelectedData: () => {
    const project = get().project;
    const activeSheet = project.sheets.find((sheet) => sheet.id === project.activeSheetId);
    if (!activeSheet) return;

    if (activeSheet.kind === "curve") {
      downloadJson(
        "selected-curves.json",
        activeSheet.curves.filter((curve) => activeSheet.selectedCurveIds.includes(curve.id)),
      );
      return;
    }

    downloadJson(
      "selected-metrics.json",
      activeSheet.metrics.filter((metric) => activeSheet.selectedMetricIds.includes(metric.id)),
    );
  },
}));

export function useActiveSheet(): Sheet | undefined {
  return useProjectStore((state) => {
    return state.project.sheets.find((sheet) => sheet.id === state.project.activeSheetId);
  });
}

export function applyCurvePipeline(sheet: CurveSheet): CurveSheet {
  if (!sheet.activeCurveId || sheet.transformDrafts.length === 0) return sheet;

  const sourceCurve = sheet.curves.find((curve) => curve.id === sheet.activeCurveId);
  if (!sourceCurve) return sheet;

  const lookupCurve = (curveId: string): Curve | undefined => {
    return sheet.curves.find((curve) => curve.id === curveId);
  };
  const sourceGeneratedCount = sheet.curves.filter(
    (curve) => curve.meta?.sourceCurveId === sourceCurve.id,
  ).length;
  const generatedCurve = createGeneratedCurve(
    sourceCurve,
    sheet.transformDrafts,
    lookupCurve,
    sourceGeneratedCount + 1,
  );

  return {
    ...sheet,
    curves: [...sheet.curves, generatedCurve],
    selectedCurveIds: [...sheet.selectedCurveIds, generatedCurve.id],
    activeCurveId: generatedCurve.id,
  };
}

export function applyScalarPipeline(sheet: ScalarSheet): ScalarSheet {
  if (!sheet.activeMetricId || sheet.transformDrafts.length === 0) return sheet;

  const sourceMetric = sheet.metrics.find((metric) => metric.id === sheet.activeMetricId);
  if (!sourceMetric) return sheet;

  const lookupMetric = (metricId: string): ScalarMetric | undefined => {
    return sheet.metrics.find((metric) => metric.id === metricId);
  };
  const sourceGeneratedCount = sheet.metrics.filter(
    (metric) => metric.meta?.sourceMetricId === sourceMetric.id,
  ).length;
  const generatedMetric = createGeneratedScalarMetric(
    sourceMetric,
    sheet.transformDrafts,
    lookupMetric,
    sourceGeneratedCount + 1,
  );

  return {
    ...sheet,
    metrics: [...sheet.metrics, generatedMetric],
    selectedMetricIds: [...sheet.selectedMetricIds, generatedMetric.id],
    activeMetricId: generatedMetric.id,
  };
}
