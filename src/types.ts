export type Curve = {
  id: string;
  name: string;
  group?: string;
  x: Array<number | string>;
  y: number[];
  meta?: Record<string, any>;
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

export type MockCurve = Curve & {
  sourceCurveId: string;
  transforms: Transform[];
};
