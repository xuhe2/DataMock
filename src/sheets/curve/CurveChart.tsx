import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { applyCurveTransformPipeline } from "./transforms";
import type { Curve, CurveSheet } from "./types";

function lineType(curve: Curve): "solid" | "dashed" {
  return curve.meta?.style?.lineType ?? (curve.meta?.kind === "generated" ? "dashed" : "solid");
}

type CurveChartProps = {
  sheet: CurveSheet;
};

export function CurveChart({ sheet }: CurveChartProps) {
  const option = useMemo(() => {
    const visibleCurves = sheet.curves.filter((curve) => sheet.selectedCurveIds.includes(curve.id));
    const activeCurve = sheet.curves.find((curve) => curve.id === sheet.activeCurveId);
    const canPreview =
      Boolean(activeCurve) &&
      sheet.transformDrafts.length > 0 &&
      sheet.transformDrafts.every((draft) => draft.type !== "reference_based" || draft.params.referenceCurveId);
    const lookupCurve = (curveId: string): Curve | undefined => {
      return sheet.curves.find((curve) => curve.id === curveId);
    };
    const previewCurve =
      activeCurve && canPreview
        ? {
            ...applyCurveTransformPipeline(activeCurve, sheet.transformDrafts, lookupCurve),
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
      tooltip: { trigger: "axis" },
      legend: { type: "scroll", top: 8 },
      grid: { top: 56, left: 52, right: 24, bottom: 72 },
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
      dataZoom: [{ type: "inside" }, { type: "slider", height: 24, bottom: 24 }],
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
        emphasis: { focus: "series" },
        data: curve.x.map((x, index) => [x, curve.y[index]]),
      })),
    };
  }, [sheet]);

  return <ReactECharts option={option} notMerge lazyUpdate className="h-full min-h-[420px] w-full" />;
}
