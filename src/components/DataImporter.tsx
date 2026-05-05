import { useState } from "react";
import { parseArrayCurve, parseCsvCurves, parseScalarMetric } from "../core/parsers";
import { useActiveSheet, useProjectStore } from "../store/useProjectStore";

export function DataImporter() {
  const activeSheet = useActiveSheet();
  const appendCurves = useProjectStore((state) => state.appendCurvesToActiveSheet);
  const appendMetrics = useProjectStore((state) => state.appendMetricsToActiveSheet);
  const [arrayName, setArrayName] = useState("Imported Array");
  const [xText, setXText] = useState("");
  const [yText, setYText] = useState("0.2, 0.25, 0.28, 0.31, 0.35");
  const [metricName, setMetricName] = useState("Imported Metric");
  const [metricValue, setMetricValue] = useState("1.23");
  const [metricUnit, setMetricUnit] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const handleCsvImport = async (file: File | undefined) => {
    if (!file || activeSheet?.kind !== "curve") return;

    try {
      const content = await file.text();
      const curves = parseCsvCurves(content);
      appendCurves(curves);
      setError(undefined);
      setSuccess(`已导入 ${curves.length} 条 CSV 曲线`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "CSV 解析失败");
      setSuccess(undefined);
    }
  };

  const handleArrayImport = () => {
    if (activeSheet?.kind !== "curve") return;

    try {
      const curve = parseArrayCurve(arrayName, yText, xText);
      appendCurves([curve]);
      setError(undefined);
      setSuccess(`已导入 ${curve.name}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "数组解析失败");
      setSuccess(undefined);
    }
  };

  const handleMetricImport = () => {
    if (activeSheet?.kind !== "scalar") return;

    try {
      const metric = parseScalarMetric(metricName, metricValue, metricUnit);
      appendMetrics([metric]);
      setError(undefined);
      setSuccess(`已导入 ${metric.name}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "指标解析失败");
      setSuccess(undefined);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Import Data</h2>
        <p className="mt-1 text-xs text-slate-500">数据会追加到当前 Sheet。</p>
      </div>

      {activeSheet?.kind === "curve" ? (
        <>
          <label className="flex cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Import CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleCsvImport(event.target.files?.[0])}
            />
          </label>

          <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">name</span>
              <input
                value={arrayName}
                onChange={(event) => setArrayName(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">x 可选</span>
              <textarea
                value={xText}
                onChange={(event) => setXText(event.target.value)}
                placeholder="留空时自动生成 1..n"
                className="h-16 w-full resize-none rounded-md border border-slate-300 bg-white p-2 font-mono text-xs leading-5 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                spellCheck={false}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">y</span>
              <textarea
                value={yText}
                onChange={(event) => setYText(event.target.value)}
                className="h-20 w-full resize-none rounded-md border border-slate-300 bg-white p-2 font-mono text-xs leading-5 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                spellCheck={false}
              />
            </label>
            <button
              type="button"
              onClick={handleArrayImport}
              className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              Import Array
            </button>
          </div>
        </>
      ) : null}

      {activeSheet?.kind === "scalar" ? (
        <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">name</span>
            <input
              value={metricName}
              onChange={(event) => setMetricName(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">value</span>
            <input
              type="number"
              value={metricValue}
              onChange={(event) => setMetricValue(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">unit 可选</span>
            <input
              value={metricUnit}
              onChange={(event) => setMetricUnit(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <button
            type="button"
            onClick={handleMetricImport}
            className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Import Metric
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </div>
      ) : null}
    </section>
  );
}
