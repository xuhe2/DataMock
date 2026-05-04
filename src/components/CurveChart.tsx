import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { useCurveStore } from "../store/useCurveStore";
import type { Curve, MockCurve } from "../types";

function isMockCurve(curve: Curve | MockCurve): curve is MockCurve {
  return "sourceCurveId" in curve;
}

export function CurveChart() {
  const curves = useCurveStore((state) => state.curves);
  const mockCurves = useCurveStore((state) => state.mockCurves);
  const selectedCurveIds = useCurveStore((state) => state.selectedCurveIds);

  const option = useMemo(() => {
    const visibleCurves = [...curves, ...mockCurves].filter((curve) => selectedCurveIds.includes(curve.id));

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
      series: visibleCurves.map((curve) => ({
        name: curve.name,
        type: "line",
        symbol: "circle",
        symbolSize: 5,
        smooth: false,
        lineStyle: {
          width: isMockCurve(curve) ? 2.5 : 2,
          type: isMockCurve(curve) ? "dashed" : "solid",
        },
        emphasis: {
          focus: "series",
        },
        data: curve.x.map((x, index) => [x, curve.y[index]]),
      })),
    };
  }, [curves, mockCurves, selectedCurveIds]);

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div>
          <h1 className="text-base font-semibold text-slate-950">数据曲线 Mock 工具</h1>
          <p className="text-xs text-slate-500">原始曲线为实线，Mock 曲线为虚线</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 bg-white p-3">
        <ReactECharts option={option} notMerge lazyUpdate className="h-full min-h-[420px] w-full" />
      </div>
    </section>
  );
}
