import { createId } from "../../core/id";
import type { ScalarMetric, ScalarSheet } from "./types";

export function prepareMetrics(metrics: ScalarMetric[]): ScalarMetric[] {
  return metrics.map((metric) => ({
    ...metric,
    meta: {
      ...metric.meta,
      kind: metric.meta?.kind ?? "raw",
    },
  }));
}

export function createScalarSheet(name: string, metrics: ScalarMetric[] = []): ScalarSheet {
  const preparedMetrics = prepareMetrics(metrics);

  return {
    id: createId("scalar_sheet"),
    name,
    kind: "scalar",
    metrics: preparedMetrics,
    selectedMetricIds: preparedMetrics.map((metric) => metric.id),
    activeMetricId: preparedMetrics[0]?.id,
    referenceMetricId: preparedMetrics[1]?.id,
    transformDrafts: [],
  };
}

export function ensureUniqueMetrics(metrics: ScalarMetric[], existingIds: string[]): ScalarMetric[] {
  const usedIds = new Set(existingIds);

  return metrics.map((metric) => {
    const baseId = metric.id.trim() || "metric";
    let nextId = baseId;
    let suffix = 2;

    while (usedIds.has(nextId)) {
      nextId = `${baseId}_${suffix}`;
      suffix += 1;
    }

    usedIds.add(nextId);

    return {
      ...metric,
      id: nextId,
    };
  });
}
