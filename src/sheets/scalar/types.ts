export type ScalarMetric = {
  id: string;
  name: string;
  value: number;
  unit?: string;
  group?: string;
  meta?: ScalarMetricMeta;
};

export type ScalarMetricMeta = {
  kind?: "raw" | "generated";
  sourceMetricId?: string;
  transforms?: ScalarTransform[];
  createdAt?: string;
  [key: string]: any;
};

export type ScalarTransformType = "scale" | "offset" | "noise" | "reference_based";

export type ScalarTransform = {
  id: string;
  metricId: string;
  type: ScalarTransformType;
  params: Record<string, any>;
};

export type ScalarTransformDraft = {
  id: string;
  type: ScalarTransformType;
  params: Record<string, any>;
};

export type ScalarSheet = {
  id: string;
  name: string;
  kind: "scalar";
  metrics: ScalarMetric[];
  selectedMetricIds: string[];
  activeMetricId?: string;
  referenceMetricId?: string;
  transformDrafts: ScalarTransformDraft[];
};
