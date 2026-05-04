import { useState } from "react";
import { parseArrayCurve, parseCsvCurves } from "../core/parsers";
import { useCurveStore } from "../store/useCurveStore";

export function DataImporter() {
  const appendCurves = useCurveStore((state) => state.appendCurves);
  const [arrayName, setArrayName] = useState("Imported Array");
  const [xText, setXText] = useState("");
  const [yText, setYText] = useState("0.2, 0.25, 0.28, 0.31, 0.35");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const handleCsvImport = async (file: File | undefined) => {
    if (!file) return;

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

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Import Data</h2>
        <p className="mt-1 text-xs text-slate-500">CSV 或数组会追加到当前 Project。</p>
      </div>

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
