import { useMemo, useState } from "react";
import { useCurveStore } from "../store/useCurveStore";
import type { TransformType } from "../types";

const transformOptions: Array<{ label: string; value: TransformType }> = [
  { label: "Scale", value: "scale" },
  { label: "Offset", value: "offset" },
  { label: "Trend", value: "trend" },
  { label: "Noise", value: "noise" },
  { label: "Smooth", value: "smooth" },
  { label: "Reference Based", value: "reference_based" },
];

function numberValue(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

type NumberInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
  min?: string;
  max?: string;
};

function NumberInput({ label, value, onChange, step = "0.01", min, max }: NumberInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}

export function TransformPanel() {
  const curves = useCurveStore((state) => state.curves);
  const activeCurveId = useCurveStore((state) => state.activeCurveId);
  const referenceCurveId = useCurveStore((state) => state.referenceCurveId);
  const setReferenceCurve = useCurveStore((state) => state.setReferenceCurve);
  const applyTransform = useCurveStore((state) => state.applyTransform);
  const resetMockCurve = useCurveStore((state) => state.resetMockCurve);
  const clearAllMockCurves = useCurveStore((state) => state.clearAllMockCurves);
  const exportMockData = useCurveStore((state) => state.exportMockData);
  const mockCurves = useCurveStore((state) => state.mockCurves);

  const [type, setType] = useState<TransformType>("scale");
  const [factor, setFactor] = useState("1.05");
  const [offset, setOffset] = useState("0.02");
  const [trendStrength, setTrendStrength] = useState("0.05");
  const [trendDirection, setTrendDirection] = useState<"up" | "down">("up");
  const [sigma, setSigma] = useState("0.01");
  const [seed, setSeed] = useState("42");
  const [windowSize, setWindowSize] = useState("3");
  const [blend, setBlend] = useState("0.5");
  const [amplitudeFactor, setAmplitudeFactor] = useState("1.05");
  const [referenceTrendStrength, setReferenceTrendStrength] = useState("0.02");

  const activeCurve = useMemo(
    () => curves.find((curve) => curve.id === activeCurveId),
    [activeCurveId, curves],
  );
  const isReferenceBased = type === "reference_based";
  const canApply = Boolean(activeCurveId) && (!isReferenceBased || Boolean(referenceCurveId));

  const params = useMemo((): Record<string, unknown> => {
    if (type === "scale") return { factor: numberValue(factor, 1) };
    if (type === "offset") return { value: numberValue(offset, 0) };
    if (type === "trend") {
      return {
        strength: numberValue(trendStrength, 0),
        direction: trendDirection,
      };
    }
    if (type === "noise") {
      return {
        sigma: numberValue(sigma, 0),
        seed: numberValue(seed, 1),
      };
    }
    if (type === "smooth") {
      return {
        windowSize: numberValue(windowSize, 3),
      };
    }
    return {
      referenceCurveId,
      blend: numberValue(blend, 0.5),
      amplitudeFactor: numberValue(amplitudeFactor, 1),
      trendStrength: numberValue(referenceTrendStrength, 0),
    };
  }, [
    amplitudeFactor,
    blend,
    factor,
    offset,
    referenceCurveId,
    referenceTrendStrength,
    seed,
    sigma,
    trendDirection,
    trendStrength,
    type,
    windowSize,
  ]);

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Mock 参数</h2>
        <p className="mt-1 truncate text-xs text-slate-500">
          Active: {activeCurve ? activeCurve.name : "未选择"}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Transform 类型</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TransformType)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            {transformOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {type === "scale" ? (
          <NumberInput label="factor" value={factor} onChange={setFactor} />
        ) : null}

        {type === "offset" ? (
          <NumberInput label="value" value={offset} onChange={setOffset} />
        ) : null}

        {type === "trend" ? (
          <div className="space-y-3">
            <NumberInput label="strength" value={trendStrength} onChange={setTrendStrength} />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">direction</span>
              <select
                value={trendDirection}
                onChange={(event) => setTrendDirection(event.target.value as "up" | "down")}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="up">up</option>
                <option value="down">down</option>
              </select>
            </label>
          </div>
        ) : null}

        {type === "noise" ? (
          <div className="space-y-3">
            <NumberInput label="sigma" value={sigma} onChange={setSigma} min="0" />
            <NumberInput label="seed" value={seed} onChange={setSeed} step="1" />
          </div>
        ) : null}

        {type === "smooth" ? (
          <NumberInput label="windowSize" value={windowSize} onChange={setWindowSize} step="1" min="1" />
        ) : null}

        {type === "reference_based" ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">referenceCurveId</span>
              <select
                value={referenceCurveId ?? ""}
                onChange={(event) => setReferenceCurve(event.target.value || undefined)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">请选择 Reference</option>
                {curves.map((curve) => (
                  <option key={curve.id} value={curve.id}>
                    {curve.name}
                  </option>
                ))}
              </select>
            </label>
            <NumberInput label="blend" value={blend} onChange={setBlend} min="0" max="1" />
            <NumberInput label="amplitudeFactor" value={amplitudeFactor} onChange={setAmplitudeFactor} />
            <NumberInput
              label="trendStrength"
              value={referenceTrendStrength}
              onChange={setReferenceTrendStrength}
            />
          </div>
        ) : null}

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="mb-2 text-xs font-medium text-slate-600">当前参数</div>
          <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-700">
            {JSON.stringify(params, null, 2)}
          </pre>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-200 p-4">
        <button
          type="button"
          disabled={!canApply}
          onClick={() => applyTransform(type, params)}
          className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Apply Transform
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!activeCurveId}
            onClick={resetMockCurve}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Reset Mock
          </button>
          <button
            type="button"
            disabled={!mockCurves.length}
            onClick={clearAllMockCurves}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Clear All
          </button>
        </div>
        <button
          type="button"
          disabled={!mockCurves.length}
          onClick={exportMockData}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Export JSON
        </button>
      </div>
    </aside>
  );
}
