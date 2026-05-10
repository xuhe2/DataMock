import { createId } from "../../core/id";
import type { ScalarTransformDraft, ScalarTransformType } from "./types";

export const scalarTransformOptions: Array<{ label: string; value: ScalarTransformType }> = [
  { label: "Scale", value: "scale" },
  { label: "Offset", value: "offset" },
  { label: "Noise", value: "noise" },
  { label: "Reference Based", value: "reference_based" },
];

export function defaultScalarTransformParams(
  type: ScalarTransformType,
  referenceMetricId?: string,
): Record<string, any> {
  if (type === "scale") return { factor: 1.05 };
  if (type === "offset") return { value: 0.02 };
  if (type === "noise") return { sigma: 0.01, randomize: false, seed: 42 };

  return {
    referenceMetricId,
    blend: 0.5,
    amplitudeFactor: 1,
  };
}

export function createScalarTransformDraft(
  type: ScalarTransformType,
  referenceMetricId?: string,
): ScalarTransformDraft {
  return {
    id: createId(type),
    type,
    params: defaultScalarTransformParams(type, referenceMetricId),
  };
}
