import type { CurveSheet } from "../sheets/curve/types";
import type { ScalarSheet } from "../sheets/scalar/types";

export type Sheet = CurveSheet | ScalarSheet;

export type CurvePipelineTemplate = {
  id: string;
  name: string;
  sheetKind: "curve";
  description?: string;
  transformDrafts: CurveSheet["transformDrafts"];
  createdAt: string;
  updatedAt: string;
};

export type ScalarPipelineTemplate = {
  id: string;
  name: string;
  sheetKind: "scalar";
  description?: string;
  transformDrafts: ScalarSheet["transformDrafts"];
  createdAt: string;
  updatedAt: string;
};

export type PipelineTemplate = CurvePipelineTemplate | ScalarPipelineTemplate;

export type DataMockProject = {
  version: 2;
  name: string;
  activeSheetId?: string;
  sheets: Sheet[];
  pipelineTemplates: PipelineTemplate[];
  savedAt: string;
};

export type LegacyDataMockProjectV1 = {
  version: 1;
  name: string;
  curves: CurveSheet["curves"];
  selectedCurveIds: string[];
  activeCurveId?: string;
  referenceCurveId?: string;
  transformDrafts: CurveSheet["transformDrafts"];
  savedAt: string;
};
