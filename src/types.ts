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
  transforms?: Transform[];
  createdAt?: string;
  style?: {
    lineType?: "solid" | "dashed";
  };
  [key: string]: any;
};

export type TransformType =
  | "scale"
  | "offset"
  | "trend"
  | "noise"
  | "smooth"
  | "reference_based";

export type Transform = {
  id: string;
  curveId: string;
  type: TransformType;
  params: Record<string, any>;
};

export type TransformDraft = {
  id: string;
  type: TransformType;
  params: Record<string, any>;
};
