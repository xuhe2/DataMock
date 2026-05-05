import { demoCurves } from "../data/demoCurves";
import { createCurveSheet, prepareCurves } from "../sheets/curve/sheet";
import { createScalarSheet } from "../sheets/scalar/sheet";
import type { DataMockProject, LegacyDataMockProjectV1, Sheet } from "./types";

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object";
}

export function createDemoProject(): DataMockProject {
  const curveSheet = createCurveSheet("Curves", demoCurves);
  const scalarSheet = createScalarSheet("Scalars", [
    {
      id: "conversion_rate",
      name: "Conversion Rate",
      value: 0.128,
      unit: "%",
    },
    {
      id: "revenue",
      name: "Revenue",
      value: 125000,
      unit: "USD",
    },
  ]);

  return {
    version: 2,
    name: "Demo Project",
    activeSheetId: curveSheet.id,
    sheets: [curveSheet, scalarSheet],
    pipelineTemplates: [],
    savedAt: new Date().toISOString(),
  };
}

export function createEmptyProject(): DataMockProject {
  const curveSheet = createCurveSheet("Curves");

  return {
    version: 2,
    name: "Untitled Project",
    activeSheetId: curveSheet.id,
    sheets: [curveSheet],
    pipelineTemplates: [],
    savedAt: new Date().toISOString(),
  };
}

export function migrateProject(input: unknown): DataMockProject {
  if (!isRecord(input)) {
    throw new Error("项目文件不是有效对象");
  }

  if (input.version === 2) {
    if (!Array.isArray(input.sheets)) {
      throw new Error("项目文件缺少 sheets");
    }

    const sheets = input.sheets.filter(isRecord).map((sheet): Sheet => {
      if (sheet.kind === "scalar") {
        return {
          id: String(sheet.id),
          name: String(sheet.name || "Scalars"),
          kind: "scalar",
          metrics: Array.isArray(sheet.metrics) ? sheet.metrics : [],
          selectedMetricIds: Array.isArray(sheet.selectedMetricIds) ? sheet.selectedMetricIds.map(String) : [],
          activeMetricId: sheet.activeMetricId,
          referenceMetricId: sheet.referenceMetricId,
          transformDrafts: Array.isArray(sheet.transformDrafts) ? sheet.transformDrafts : [],
        };
      }

      return {
        id: String(sheet.id),
        name: String(sheet.name || "Curves"),
        kind: "curve",
        curves: prepareCurves(Array.isArray(sheet.curves) ? sheet.curves : []),
        selectedCurveIds: Array.isArray(sheet.selectedCurveIds) ? sheet.selectedCurveIds.map(String) : [],
        activeCurveId: sheet.activeCurveId,
        referenceCurveId: sheet.referenceCurveId,
        transformDrafts: Array.isArray(sheet.transformDrafts) ? sheet.transformDrafts : [],
      };
    });

    return {
      version: 2,
      name: String(input.name || "Untitled Project"),
      activeSheetId: input.activeSheetId && sheets.some((sheet) => sheet.id === input.activeSheetId)
        ? String(input.activeSheetId)
        : sheets[0]?.id,
      sheets,
      pipelineTemplates: Array.isArray(input.pipelineTemplates) ? input.pipelineTemplates : [],
      savedAt: String(input.savedAt || new Date().toISOString()),
    };
  }

  if (input.version === 1) {
    const legacy = input as LegacyDataMockProjectV1;
    const curveSheet = createCurveSheet("Curves", legacy.curves ?? []);

    return {
      version: 2,
      name: legacy.name || "Untitled Project",
      activeSheetId: curveSheet.id,
      sheets: [
        {
          ...curveSheet,
          selectedCurveIds: legacy.selectedCurveIds ?? curveSheet.selectedCurveIds,
          activeCurveId: legacy.activeCurveId ?? curveSheet.activeCurveId,
          referenceCurveId: legacy.referenceCurveId ?? curveSheet.referenceCurveId,
          transformDrafts: legacy.transformDrafts ?? [],
        },
      ],
      pipelineTemplates: [],
      savedAt: legacy.savedAt || new Date().toISOString(),
    };
  }

  throw new Error("不支持的项目文件版本");
}
