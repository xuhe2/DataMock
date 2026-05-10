import { HistogramIcon } from "../../components/HistogramIcon";
import { groupItems } from "../../core/grouping";
import { applyScalarTransformPipeline } from "./transforms";
import { ScalarTransformHistory } from "./ScalarTransformHistory";
import type { ScalarMetric, ScalarSheet } from "./types";

type ScalarSheetViewProps = {
  sheet: ScalarSheet;
};

function formatValue(metric: ScalarMetric): string {
  const value = Number.isInteger(metric.value) ? String(metric.value) : metric.value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  return metric.unit ? `${value} ${metric.unit}` : value;
}

export function ScalarSheetView({ sheet }: ScalarSheetViewProps) {
  const activeMetric = sheet.metrics.find((metric) => metric.id === sheet.activeMetricId);
  const canPreview =
    Boolean(activeMetric) &&
    sheet.transformDrafts.length > 0 &&
    sheet.transformDrafts.every((draft) => draft.type !== "reference_based" || draft.params.referenceMetricId);
  const previewMetric =
    activeMetric && canPreview
      ? applyScalarTransformPipeline(activeMetric, sheet.transformDrafts, (metricId) =>
          sheet.metrics.find((metric) => metric.id === metricId),
        )
      : undefined;
  const visibleMetrics = sheet.metrics.filter((metric) => sheet.selectedMetricIds.includes(metric.id));
  const groupedMetrics = groupItems(visibleMetrics);

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div>
          <h1 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <HistogramIcon className="h-4 w-4 text-slate-500" />
            {sheet.name}
          </h1>
          <p className="text-xs text-slate-500">Scalar Sheet 使用指标卡片展示单个数值。</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5">
        {previewMetric ? (
          <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 p-4">
            <div className="text-xs font-semibold uppercase text-sky-700">Preview</div>
            <div className="mt-1 text-sm text-slate-600">{activeMetric?.name}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">{formatValue(previewMetric)}</div>
          </div>
        ) : null}
        <div className="space-y-5">
          {groupedMetrics.map((group) => (
            <section key={group.name} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
                  <HistogramIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{group.name}</span>
                </h2>
                <span className="text-xs text-slate-400">{group.items.length} metrics</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((metric) => (
                  <div key={metric.id} className="rounded-md border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{metric.name}</div>
                        <div className="mt-1 truncate text-xs text-slate-500">{metric.id}</div>
                      </div>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {metric.meta?.kind === "generated" ? "Generated" : "Raw"}
                      </span>
                    </div>
                    <div className="mt-4 text-2xl font-semibold text-slate-950">{formatValue(metric)}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {groupedMetrics.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              没有可显示的指标
            </div>
          ) : null}
        </div>
      </div>
      <ScalarTransformHistory sheet={sheet} />
    </section>
  );
}
