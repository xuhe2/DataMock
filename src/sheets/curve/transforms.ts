import { asNumber, average } from "../../core/math";
import { createId } from "../../core/id";
import { createSeededRandom, randomNormal } from "../../core/random";
import type { Curve, CurveTransform, CurveTransformDraft } from "./types";

type CurveLookup = (curveId: string) => Curve | undefined;

function normalizeDirection(value: unknown): "up" | "down" {
  return value === "down" ? "down" : "up";
}

function normalizedIndex(index: number, length: number): number {
  return length <= 1 ? 0 : index / (length - 1);
}

function normalizeParams(transform: Pick<CurveTransform, "type" | "params">): Record<string, unknown> {
  const params = transform.params;

  if (transform.type === "scale") {
    return { factor: asNumber(params.factor, 1) };
  }

  if (transform.type === "offset") {
    return { value: asNumber(params.value, 0) };
  }

  if (transform.type === "trend") {
    return {
      strength: asNumber(params.strength, 0),
      direction: normalizeDirection(params.direction),
    };
  }

  if (transform.type === "noise") {
    const randomize = params.randomize === true;

    return {
      sigma: Math.max(0, asNumber(params.sigma, 0)),
      randomize,
      seed: randomize ? undefined : Math.trunc(asNumber(params.seed, 1)),
    };
  }

  if (transform.type === "smooth") {
    return {
      windowSize: Math.max(1, Math.trunc(asNumber(params.windowSize, 3))),
    };
  }

  return {
    referenceCurveId: String(params.referenceCurveId ?? ""),
    blend: Math.min(1, Math.max(0, asNumber(params.blend, 0.5))),
    amplitudeFactor: asNumber(params.amplitudeFactor, 1),
    trendStrength: asNumber(params.trendStrength, 0),
  };
}

function applyScale(y: number[], params: Record<string, unknown>): number[] {
  const factor = asNumber(params.factor, 1);
  return y.map((value) => value * factor);
}

function applyOffset(y: number[], params: Record<string, unknown>): number[] {
  const value = asNumber(params.value, 0);
  return y.map((point) => point + value);
}

function applyTrend(y: number[], params: Record<string, unknown>): number[] {
  const strength = asNumber(params.strength, 0);
  const direction = normalizeDirection(params.direction);
  return y.map((value, index) => {
    const delta = strength * normalizedIndex(index, y.length);
    return direction === "up" ? value + delta : value - delta;
  });
}

function applyNoise(y: number[], params: Record<string, unknown>): number[] {
  const sigma = Math.max(0, asNumber(params.sigma, 0));
  const random = params.randomize === true
    ? Math.random
    : createSeededRandom(Math.trunc(asNumber(params.seed, 1)));
  return y.map((value) => value + randomNormal(random, 0, sigma));
}

function applySmooth(y: number[], params: Record<string, unknown>): number[] {
  const windowSize = Math.max(1, Math.trunc(asNumber(params.windowSize, 3)));
  const radius = Math.floor(windowSize / 2);

  return y.map((_, index) => {
    const start = Math.max(0, index - radius);
    const end = Math.min(y.length, index + radius + 1);
    return average(y.slice(start, end));
  });
}

function applyReferenceBased(
  curve: Curve,
  params: Record<string, unknown>,
  lookupCurve: CurveLookup,
): Curve {
  const referenceCurveId = String(params.referenceCurveId ?? "");
  const referenceCurve = lookupCurve(referenceCurveId);

  if (!referenceCurve) {
    return curve;
  }

  const length = Math.min(curve.y.length, referenceCurve.y.length);
  const blend = Math.min(1, Math.max(0, asNumber(params.blend, 0.5)));
  const amplitudeFactor = asNumber(params.amplitudeFactor, 1);
  const trendStrength = asNumber(params.trendStrength, 0);
  const blendedY = curve.y.slice(0, length).map((value, index) => {
    return value * (1 - blend) + referenceCurve.y[index] * blend;
  });
  const mean = average(blendedY);
  const resultY = blendedY.map((value, index) => {
    const amplified = mean + (value - mean) * amplitudeFactor;
    return amplified + trendStrength * normalizedIndex(index, length);
  });

  return {
    ...curve,
    x: curve.x.slice(0, length),
    y: resultY,
  };
}

export function applySingleCurveTransform(
  curve: Curve,
  transform: CurveTransform,
  lookupCurve: CurveLookup,
): Curve {
  if (transform.type === "reference_based") {
    return applyReferenceBased(curve, transform.params, lookupCurve);
  }

  const nextY =
    transform.type === "scale"
      ? applyScale(curve.y, transform.params)
      : transform.type === "offset"
        ? applyOffset(curve.y, transform.params)
        : transform.type === "trend"
          ? applyTrend(curve.y, transform.params)
          : transform.type === "noise"
            ? applyNoise(curve.y, transform.params)
            : applySmooth(curve.y, transform.params);

  return {
    ...curve,
    y: nextY,
  };
}

function toTransform(sourceCurveId: string, draft: CurveTransformDraft): CurveTransform {
  return {
    id: draft.id,
    curveId: sourceCurveId,
    type: draft.type,
    params: normalizeParams(draft),
  };
}

export function applyCurveTransformPipeline(
  sourceCurve: Curve,
  drafts: CurveTransformDraft[],
  lookupCurve: CurveLookup,
): Curve {
  return drafts.reduce<Curve>((current, draft) => {
    return applySingleCurveTransform(current, toTransform(sourceCurve.id, draft), lookupCurve);
  }, sourceCurve);
}

export function createGeneratedCurve(
  sourceCurve: Curve,
  drafts: CurveTransformDraft[],
  lookupCurve: CurveLookup,
  index: number,
): Curve {
  const transformed = applyCurveTransformPipeline(sourceCurve, drafts, lookupCurve);
  const transforms = drafts.map((draft) => toTransform(sourceCurve.id, draft));

  return {
    ...transformed,
    id: createId(`generated_${sourceCurve.id}_${index}`),
    name: `${sourceCurve.name} Mock ${index}`,
    meta: {
      kind: "generated",
      sourceCurveId: sourceCurve.id,
      transforms,
      createdAt: new Date().toISOString(),
      style: {
        lineType: "dashed",
      },
    },
  };
}
