import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { applyTransformPipeline } from "../core/transforms";
import { useCurveStore } from "../store/useCurveStore";
import type { Curve } from "../types";

function lineType(curve: Curve): "solid" | "dashed" {
  return curve.meta?.style?.lineType ?? (curve.meta?.kind === "generated" ? "dashed" : "solid");
}

export function CurveChart() {
  const curves = useCurveStore((state) => state.curves);
  const selectedCurveIds = useCurveStore((state) => state.selectedCurveIds);
  const activeCurveId = useCurveStore((state) => state.activeCurveId);
  const transformDrafts = useCurveStore((state) => state.transformDrafts);

  const option = useMemo(() => {
    const visibleCurves = curves.filter((curve) => selectedCurveIds.includes(curve.id));
    const activeCurve = curves.find((curve) => curve.id === activeCurveId);
    const canPreview =
      Boolean(activeCurve) &&
      transformDrafts.length > 0 &&
      transformDrafts.every((draft) => draft.type !== "reference_based" || draft.params.referenceCurveId);
    const lookupCurve = (curveId: string): Curve | undefined => {
      return curves.find((curve) => curve.id === curveId);
    };
    const previewCurve =
      activeCurve && canPreview
        ? {
            ...applyTransformPipeline(activeCurve, transformDrafts, lookupCurve),
            id: "__preview__",
            name: `${activeCurve.name} Preview`,
            meta: {
              kind: "generated" as const,
              style: {
                lineType: "dashed" as const,
              },
            },
          }
        : undefined;
    const chartCurves = previewCurve ? [...visibleCurves, previewCurve] : visibleCurves;

    return {
      animation: false,
      color: ["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#6366f1"],
      tooltip: {
        trigger: "axis",
      },
      legend: {
        type: "scroll",
        top: 8,
      },
      grid: {
        top: 56,
        left: 52,
        right: 24,
        bottom: 72,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b" },
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLabel: { color: "#64748b" },
        splitLine: { lineStyle: { color: "#e2e8f0" } },
      },
      dataZoom: [
        {
          type: "inside",
        },
        {
          type: "slider",
          height: 24,
          bottom: 24,
        },
      ],
      series: chartCurves.map((curve) => ({
        name: curve.name,
        type: "line",
        symbol: "circle",
        symbolSize: 5,
        smooth: false,
        lineStyle: {
          width: curve.id === "__preview__" ? 3 : lineType(curve) === "dashed" ? 2.5 : 2,
          type: lineType(curve),
          opacity: curve.id === "__preview__" ? 0.9 : 1,
        },
        itemStyle: curve.id === "__preview__" ? { opacity: 0.9 } : undefined,
        emphasis: {
          focus: "series",
        },
        data: curve.x.map((x, index) => [x, curve.y[index]]),
      })),
    };
  }, [activeCurveId, curves, selectedCurveIds, transformDrafts]);

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div>
          <h1 className="text-base font-semibold text-slate-950">数据曲线 Mock 工具</h1>
          <p className="text-xs text-slate-500">Raw 曲线为实线，Generated 和 Preview 曲线为虚线</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 bg-white p-3">
        <ReactECharts option={option} notMerge lazyUpdate className="h-full min-h-[420px] w-full" />
      </div>
    </section>
  );
}
