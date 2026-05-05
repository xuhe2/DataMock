import { asNumber } from "../../core/math";
import { createId } from "../../core/id";
import { createSeededRandom, randomNormal } from "../../core/random";
import type { ScalarMetric, ScalarTransform, ScalarTransformDraft } from "./types";

type MetricLookup = (metricId: string) => ScalarMetric | undefined;

function normalizeParams(transform: Pick<ScalarTransform, "type" | "params">): Record<string, unknown> {
  const params = transform.params;

  if (transform.type === "scale") {
    return { factor: asNumber(params.factor, 1) };
  }

  if (transform.type === "offset") {
    return { value: asNumber(params.value, 0) };
  }

  if (transform.type === "noise") {
    return {
      sigma: Math.max(0, asNumber(params.sigma, 0)),
      seed: Math.trunc(asNumber(params.seed, 1)),
    };
  }

  return {
    referenceMetricId: String(params.referenceMetricId ?? ""),
    blend: Math.min(1, Math.max(0, asNumber(params.blend, 0.5))),
    amplitudeFactor: asNumber(params.amplitudeFactor, 1),
  };
}

function applyReferenceBased(
  metric: ScalarMetric,
  params: Record<string, unknown>,
  lookupMetric: MetricLookup,
): ScalarMetric {
  const referenceMetricId = String(params.referenceMetricId ?? "");
  const referenceMetric = lookupMetric(referenceMetricId);

  if (!referenceMetric) {
    return metric;
  }

  const blend = Math.min(1, Math.max(0, asNumber(params.blend, 0.5)));
  const amplitudeFactor = asNumber(params.amplitudeFactor, 1);
  const blended = metric.value * (1 - blend) + referenceMetric.value * blend;

  return {
    ...metric,
    value: blended * amplitudeFactor,
  };
}

export function applySingleScalarTransform(
  metric: ScalarMetric,
  transform: ScalarTransform,
  lookupMetric: MetricLookup,
): ScalarMetric {
  if (transform.type === "scale") {
    return { ...metric, value: metric.value * asNumber(transform.params.factor, 1) };
  }

  if (transform.type === "offset") {
    return { ...metric, value: metric.value + asNumber(transform.params.value, 0) };
  }

  if (transform.type === "noise") {
    const sigma = Math.max(0, asNumber(transform.params.sigma, 0));
    const seed = Math.trunc(asNumber(transform.params.seed, 1));
    const random = createSeededRandom(seed);
    return { ...metric, value: metric.value + randomNormal(random, 0, sigma) };
  }

  return applyReferenceBased(metric, transform.params, lookupMetric);
}

function toTransform(sourceMetricId: string, draft: ScalarTransformDraft): ScalarTransform {
  return {
    id: draft.id,
    metricId: sourceMetricId,
    type: draft.type,
    params: normalizeParams(draft),
  };
}

export function applyScalarTransformPipeline(
  sourceMetric: ScalarMetric,
  drafts: ScalarTransformDraft[],
  lookupMetric: MetricLookup,
): ScalarMetric {
  return drafts.reduce<ScalarMetric>((current, draft) => {
    return applySingleScalarTransform(current, toTransform(sourceMetric.id, draft), lookupMetric);
  }, sourceMetric);
}

export function createGeneratedScalarMetric(
  sourceMetric: ScalarMetric,
  drafts: ScalarTransformDraft[],
  lookupMetric: MetricLookup,
  index: number,
): ScalarMetric {
  const transformed = applyScalarTransformPipeline(sourceMetric, drafts, lookupMetric);
  const transforms = drafts.map((draft) => toTransform(sourceMetric.id, draft));

  return {
    ...transformed,
    id: createId(`generated_${sourceMetric.id}_${index}`),
    name: `${sourceMetric.name} Mock ${index}`,
    meta: {
      kind: "generated",
      sourceMetricId: sourceMetric.id,
      transforms,
      createdAt: new Date().toISOString(),
    },
  };
}
