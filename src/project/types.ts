import type { CurveSheet } from "../sheets/curve/types";
import type { ScalarSheet } from "../sheets/scalar/types";

export type Sheet = CurveSheet | ScalarSheet;

export type DataMockProject = {
  version: 2;
  name: string;
  activeSheetId?: string;
  sheets: Sheet[];
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
