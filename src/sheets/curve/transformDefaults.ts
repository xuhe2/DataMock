import { createId } from "../../core/id";
import type { CurveTransformDraft, CurveTransformType } from "./types";

export const curveTransformOptions: Array<{ label: string; value: CurveTransformType }> = [
  { label: "Scale", value: "scale" },
  { label: "Offset", value: "offset" },
  { label: "Trend", value: "trend" },
  { label: "Noise", value: "noise" },
  { label: "Smooth", value: "smooth" },
  { label: "Reference Based", value: "reference_based" },
];

export function defaultCurveTransformParams(
  type: CurveTransformType,
  referenceCurveId?: string,
): Record<string, any> {
  if (type === "scale") return { factor: 1.05 };
  if (type === "offset") return { value: 0.02 };
  if (type === "trend") return { strength: 0.05, direction: "up" };
  if (type === "noise") return { sigma: 0.01, randomize: false, seed: 42 };
  if (type === "smooth") return { windowSize: 3 };

  return {
    referenceCurveId,
    blend: 0.5,
    amplitudeFactor: 1.05,
    trendStrength: 0.02,
  };
}

export function createCurveTransformDraft(
  type: CurveTransformType,
  referenceCurveId?: string,
): CurveTransformDraft {
  return {
    id: createId(type),
    type,
    params: defaultCurveTransformParams(type, referenceCurveId),
  };
}
