import { createId } from "../../core/id";
import type { Curve, CurveSheet } from "./types";

export function prepareCurves(curves: Curve[]): Curve[] {
  return curves.map((curve) => ({
    ...curve,
    meta: {
      ...curve.meta,
      kind: curve.meta?.kind ?? "raw",
      style: {
        lineType: curve.meta?.style?.lineType ?? "solid",
      },
    },
  }));
}

export function createCurveSheet(name: string, curves: Curve[] = []): CurveSheet {
  const preparedCurves = prepareCurves(curves);

  return {
    id: createId("curve_sheet"),
    name,
    kind: "curve",
    curves: preparedCurves,
    selectedCurveIds: preparedCurves.map((curve) => curve.id),
    activeCurveId: preparedCurves[0]?.id,
    referenceCurveId: preparedCurves[1]?.id,
    transformDrafts: [],
  };
}

export function ensureUniqueCurves(curves: Curve[], existingIds: string[]): Curve[] {
  const usedIds = new Set(existingIds);

  return curves.map((curve) => {
    const baseId = curve.id.trim() || "curve";
    let nextId = baseId;
    let suffix = 2;

    while (usedIds.has(nextId)) {
      nextId = `${baseId}_${suffix}`;
      suffix += 1;
    }

    usedIds.add(nextId);

    return {
      ...curve,
      id: nextId,
    };
  });
}
