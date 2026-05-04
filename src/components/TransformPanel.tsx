import { useMemo, useState } from "react";
import { useCurveStore } from "../store/useCurveStore";
import type { TransformDraft, TransformType } from "../types";

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

function createDraftId(type: TransformType): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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

type TransformParamsEditorProps = {
  draft: TransformDraft;
  curves: Array<{ id: string; name: string }>;
  onChange: (params: Record<string, any>) => void;
};

function TransformParamsEditor({ draft, curves, onChange }: TransformParamsEditorProps) {
  const params = draft.params;

  if (draft.type === "scale") {
    return (
      <NumberInput
        label="factor"
        value={String(params.factor ?? 1)}
        onChange={(value) => onChange({ factor: numberValue(value, 1) })}
      />
    );
  }

  if (draft.type === "offset") {
    return (
      <NumberInput
        label="value"
        value={String(params.value ?? 0)}
        onChange={(value) => onChange({ value: numberValue(value, 0) })}
      />
    );
  }

  if (draft.type === "trend") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="strength"
          value={String(params.strength ?? 0)}
          onChange={(value) =>
            onChange({
              ...params,
              strength: numberValue(value, 0),
            })
          }
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">direction</span>
          <select
            value={String(params.direction ?? "up")}
            onChange={(event) =>
              onChange({
                ...params,
                direction: event.target.value,
              })
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="up">up</option>
            <option value="down">down</option>
          </select>
        </label>
      </div>
    );
  }

  if (draft.type === "noise") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="sigma"
          value={String(params.sigma ?? 0)}
          min="0"
          onChange={(value) =>
            onChange({
              ...params,
              sigma: numberValue(value, 0),
            })
          }
        />
        <NumberInput
          label="seed"
          value={String(params.seed ?? 1)}
          step="1"
          onChange={(value) =>
            onChange({
              ...params,
              seed: numberValue(value, 1),
            })
          }
        />
      </div>
    );
  }

  if (draft.type === "smooth") {
    return (
      <NumberInput
        label="windowSize"
        value={String(params.windowSize ?? 3)}
        step="1"
        min="1"
        onChange={(value) => onChange({ windowSize: numberValue(value, 3) })}
      />
    );
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">referenceCurveId</span>
        <select
          value={String(params.referenceCurveId ?? "")}
          onChange={(event) =>
            onChange({
              ...params,
              referenceCurveId: event.target.value,
            })
          }
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
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label="blend"
          value={String(params.blend ?? 0.5)}
          min="0"
          max="1"
          onChange={(value) =>
            onChange({
              ...params,
              blend: numberValue(value, 0.5),
            })
          }
        />
        <NumberInput
          label="amplitude"
          value={String(params.amplitudeFactor ?? 1)}
          onChange={(value) =>
            onChange({
              ...params,
              amplitudeFactor: numberValue(value, 1),
            })
          }
        />
        <NumberInput
          label="trend"
          value={String(params.trendStrength ?? 0)}
          onChange={(value) =>
            onChange({
              ...params,
              trendStrength: numberValue(value, 0),
            })
          }
        />
      </div>
    </div>
  );
}

function defaultParams(type: TransformType, referenceCurveId?: string): Record<string, any> {
  if (type === "scale") return { factor: 1.05 };
  if (type === "offset") return { value: 0.02 };
  if (type === "trend") return { strength: 0.05, direction: "up" };
  if (type === "noise") return { sigma: 0.01, seed: 42 };
  if (type === "smooth") return { windowSize: 3 };

  return {
    referenceCurveId,
    blend: 0.5,
    amplitudeFactor: 1.05,
    trendStrength: 0.02,
  };
}

export function TransformPanel() {
  const curves = useCurveStore((state) => state.curves);
  const activeCurveId = useCurveStore((state) => state.activeCurveId);
  const referenceCurveId = useCurveStore((state) => state.referenceCurveId);
  const setReferenceCurve = useCurveStore((state) => state.setReferenceCurve);
  const transformDrafts = useCurveStore((state) => state.transformDrafts);
  const addTransformDraft = useCurveStore((state) => state.addTransformDraft);
  const updateTransformDraft = useCurveStore((state) => state.updateTransformDraft);
  const removeTransformDraft = useCurveStore((state) => state.removeTransformDraft);
  const moveTransformDraft = useCurveStore((state) => state.moveTransformDraft);
  const clearTransformDrafts = useCurveStore((state) => state.clearTransformDrafts);
  const applyTransformPipeline = useCurveStore((state) => state.applyTransformPipeline);
  const exportSelectedCurves = useCurveStore((state) => state.exportSelectedCurves);

  const [type, setType] = useState<TransformType>("scale");
  const activeCurve = useMemo(
    () => curves.find((curve) => curve.id === activeCurveId),
    [activeCurveId, curves],
  );
  const hasInvalidReferenceStep = transformDrafts.some((draft) => {
    return draft.type === "reference_based" && !draft.params.referenceCurveId;
  });
  const canApply = Boolean(activeCurveId) && transformDrafts.length > 0 && !hasInvalidReferenceStep;

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Transform Pipeline</h2>
        <p className="mt-1 truncate text-xs text-slate-500">
          Active: {activeCurve ? activeCurve.name : "未选择"}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
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

          {type === "reference_based" ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">默认 Reference</span>
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
          ) : null}

          <button
            type="button"
            onClick={() =>
              addTransformDraft({
                id: createDraftId(type),
                type,
                params: defaultParams(type, referenceCurveId),
              })
            }
            className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Add Step
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Pipeline Steps</h3>
            <span className="text-xs text-slate-500">{transformDrafts.length} steps</span>
          </div>

          {transformDrafts.length ? (
            <div className="space-y-2">
              {transformDrafts.map((draft, index) => (
                <div key={draft.id} className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </span>
                    <select
                      value={draft.type}
                      onChange={(event) => {
                        const nextType = event.target.value as TransformType;
                        updateTransformDraft(draft.id, {
                          type: nextType,
                          params: defaultParams(nextType, referenceCurveId),
                        });
                      }}
                      className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      {transformOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <TransformParamsEditor
                    draft={draft}
                    curves={curves}
                    onChange={(params) => updateTransformDraft(draft.id, { params })}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveTransformDraft(draft.id, "up")}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={index === transformDrafts.length - 1}
                      onClick={() => moveTransformDraft(draft.id, "down")}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTransformDraft(draft.id)}
                      className="rounded-md border border-red-200 bg-white px-2 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-xs text-slate-500">
              先添加一个或多个 Transform step。
            </div>
          )}
        </section>
      </div>

      <div className="space-y-2 border-t border-slate-200 p-4">
        {hasInvalidReferenceStep ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Reference Based step 需要选择 reference curve。
          </div>
        ) : null}
        <button
          type="button"
          disabled={!canApply}
          onClick={applyTransformPipeline}
          className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Apply Pipeline
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!transformDrafts.length}
            onClick={clearTransformDrafts}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Clear Steps
          </button>
          <button
            type="button"
            disabled={!curves.length}
            onClick={exportSelectedCurves}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Export Selected
          </button>
        </div>
      </div>
    </aside>
  );
}
