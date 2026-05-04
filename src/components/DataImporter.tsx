import { useMemo, useState } from "react";
import { parseCsvCurves, parseJsonCurves } from "../core/parsers";
import { demoCurves } from "../data/demoCurves";
import { useCurveStore } from "../store/useCurveStore";

const exampleJson = JSON.stringify(demoCurves.slice(0, 2), null, 2);

export function DataImporter() {
  const setCurves = useCurveStore((state) => state.setCurves);
  const [jsonText, setJsonText] = useState(exampleJson);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const rowsLabel = useMemo(() => {
    try {
      return `${parseJsonCurves(jsonText).length} 条曲线`;
    } catch {
      return "等待导入";
    }
  }, [jsonText]);

  const handleJsonImport = () => {
    try {
      const curves = parseJsonCurves(jsonText);
      setCurves(curves);
      setError(undefined);
      setSuccess(`已导入 ${curves.length} 条 JSON 曲线`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "JSON 解析失败");
      setSuccess(undefined);
    }
  };

  const handleCsvImport = async (file: File | undefined) => {
    if (!file) return;

    try {
      const content = await file.text();
      const curves = parseCsvCurves(content);
      setCurves(curves);
      setError(undefined);
      setSuccess(`已导入 ${curves.length} 条 CSV 曲线`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "CSV 解析失败");
      setSuccess(undefined);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">数据导入</h2>
        <span className="text-xs text-slate-500">{rowsLabel}</span>
      </div>

      <textarea
        value={jsonText}
        onChange={(event) => setJsonText(event.target.value)}
        className="h-44 w-full resize-none rounded-md border border-slate-300 bg-white p-3 font-mono text-xs leading-5 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        spellCheck={false}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleJsonImport}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          导入 JSON
        </button>
        <label className="flex cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          上传 CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => void handleCsvImport(event.target.files?.[0])}
          />
        </label>
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
