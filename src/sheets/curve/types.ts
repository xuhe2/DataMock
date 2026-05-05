export type Curve = {
  id: string;
  name: string;
  group?: string;
  x: Array<number | string>;
  y: number[];
  meta?: CurveMeta;
};

export type CurveMeta = {
  kind?: "raw" | "generated";
  sourceCurveId?: string;
  transforms?: CurveTransform[];
  createdAt?: string;
  style?: {
    lineType?: "solid" | "dashed";
  };
  [key: string]: any;
};

export type CurveTransformType =
  | "scale"
  | "offset"
  | "trend"
  | "noise"
  | "smooth"
  | "reference_based";

export type CurveTransform = {
  id: string;
  curveId: string;
  type: CurveTransformType;
  params: Record<string, any>;
};

export type CurveTransformDraft = {
  id: string;
  type: CurveTransformType;
  params: Record<string, any>;
};

export type CurveSheet = {
  id: string;
  name: string;
  kind: "curve";
  curves: Curve[];
  selectedCurveIds: string[];
  activeCurveId?: string;
  referenceCurveId?: string;
  transformDrafts: CurveTransformDraft[];
};
