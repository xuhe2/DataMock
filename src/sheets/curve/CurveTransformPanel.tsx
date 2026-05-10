import { useMemo, useState } from "react";
import { HelpHint } from "../../components/HelpHint";
import { PipelineTemplateControls } from "../../components/PipelineTemplateControls";
import { applyCurvePipeline, useProjectStore } from "../../store/useProjectStore";
import { curveTransformHelp } from "./transformHelp";
import {
  createCurveTransformDraft,
  curveTransformOptions,
  defaultCurveTransformParams,
} from "./transformDefaults";
import type { CurveSheet, CurveTransformDraft, CurveTransformType } from "./types";

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

type ParamsEditorProps = {
  draft: CurveTransformDraft;
  sheet: CurveSheet;
  onChange: (params: Record<string, any>) => void;
};

function CurveParamsEditor({ draft, sheet, onChange }: ParamsEditorProps) {
  const params = draft.params;

  if (draft.type === "scale") {
    return <NumberInput label="factor" value={String(params.factor ?? 1)} onChange={(factor) => onChange({ factor })} />;
  }

  if (draft.type === "offset") {
    return <NumberInput label="value" value={String(params.value ?? 0)} onChange={(value) => onChange({ value })} />;
  }

  if (draft.type === "trend") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="strength"
          value={String(params.strength ?? 0)}
          onChange={(strength) => onChange({ ...params, strength })}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">direction</span>
          <select
            value={String(params.direction ?? "up")}
            onChange={(event) => onChange({ ...params, direction: event.target.value })}
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
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="sigma"
            value={String(params.sigma ?? 0)}
            min="0"
            onChange={(sigma) => onChange({ ...params, sigma })}
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">seed</span>
            <input
              type="number"
              value={String(params.seed ?? "")}
              step="1"
              disabled={params.randomize === true}
              onChange={(event) => onChange({ ...params, seed: event.target.value })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={params.randomize === true}
            onChange={(event) => onChange({ ...params, randomize: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          Use random seed each time
        </label>
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
        onChange={(windowSize) => onChange({ windowSize })}
      />
    );
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">referenceCurveId</span>
        <select
          value={String(params.referenceCurveId ?? "")}
          onChange={(event) => onChange({ ...params, referenceCurveId: event.target.value })}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">请选择 Reference</option>
          {sheet.curves.map((curve) => (
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
          onChange={(blend) => onChange({ ...params, blend })}
        />
        <NumberInput
          label="amplitude"
          value={String(params.amplitudeFactor ?? 1)}
          onChange={(amplitudeFactor) => onChange({ ...params, amplitudeFactor })}
        />
        <NumberInput
          label="trend"
          value={String(params.trendStrength ?? 0)}
          onChange={(trendStrength) => onChange({ ...params, trendStrength })}
        />
      </div>
    </div>
  );
}

type CurveTransformPanelProps = {
  sheet: CurveSheet;
};

export function CurveTransformPanel({ sheet }: CurveTransformPanelProps) {
  const updateCurveSheet = useProjectStore((state) => state.updateCurveSheet);
  const exportSelectedData = useProjectStore((state) => state.exportSelectedData);
  const [type, setType] = useState<CurveTransformType>("scale");
  const activeCurve = useMemo(
    () => sheet.curves.find((curve) => curve.id === sheet.activeCurveId),
    [sheet.activeCurveId, sheet.curves],
  );
  const hasInvalidReferenceStep = sheet.transformDrafts.some((draft) => {
    return draft.type === "reference_based" && !draft.params.referenceCurveId;
  });
  const canApply = Boolean(sheet.activeCurveId) && sheet.transformDrafts.length > 0 && !hasInvalidReferenceStep;
  const sanitizeTemplateDrafts = (drafts: CurveTransformDraft[]): CurveTransformDraft[] => {
    const curveIds = new Set(sheet.curves.map((curve) => curve.id));

    return drafts.map((draft) => {
      if (draft.type !== "reference_based") return draft;

      const referenceCurveId = String(draft.params.referenceCurveId ?? "");
      return {
        ...draft,
        params: {
          ...draft.params,
          referenceCurveId: curveIds.has(referenceCurveId) ? referenceCurveId : "",
        },
      };
    });
  };

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Curve Pipeline</h2>
        <p className="mt-1 truncate text-xs text-slate-500">
          Active: {activeCurve ? activeCurve.name : "未选择"}
        </p>
        {canApply ? <p className="mt-1 text-xs text-sky-700">图表正在实时预览当前 Pipeline。</p> : null}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">选择要添加的 Transform</span>
            <HelpHint help={curveTransformHelp[type]} />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Transform 类型</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as CurveTransformType)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              {curveTransformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              updateCurveSheet(sheet.id, (current) => ({
                ...current,
                transformDrafts: [
                  ...current.transformDrafts,
                  createCurveTransformDraft(type, current.referenceCurveId),
                ],
              }))
            }
            className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Add Step
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Pipeline Steps</h3>
            <span className="text-xs text-slate-500">{sheet.transformDrafts.length} steps</span>
          </div>
          {sheet.transformDrafts.length ? (
            <div className="space-y-2">
              {sheet.transformDrafts.map((draft, index) => (
                <div key={draft.id} className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </span>
                    <select
                      value={draft.type}
                      onChange={(event) => {
                        const nextType = event.target.value as CurveTransformType;
                        updateCurveSheet(sheet.id, (current) => ({
                          ...current,
                          transformDrafts: current.transformDrafts.map((item) =>
                            item.id === draft.id
                              ? {
                                  ...item,
                                  type: nextType,
                                  params: defaultCurveTransformParams(nextType, current.referenceCurveId),
                                }
                              : item,
                          ),
                        }));
                      }}
                      className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      {curveTransformOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <HelpHint help={curveTransformHelp[draft.type]} />
                  </div>
                  <CurveParamsEditor
                    draft={draft}
                    sheet={sheet}
                    onChange={(params) =>
                      updateCurveSheet(sheet.id, (current) => ({
                        ...current,
                        transformDrafts: current.transformDrafts.map((item) =>
                          item.id === draft.id ? { ...item, params } : item,
                        ),
                      }))
                    }
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        updateCurveSheet(sheet.id, (current) => {
                          const drafts = [...current.transformDrafts];
                          [drafts[index - 1], drafts[index]] = [drafts[index], drafts[index - 1]];
                          return { ...current, transformDrafts: drafts };
                        })
                      }
                      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={index === sheet.transformDrafts.length - 1}
                      onClick={() =>
                        updateCurveSheet(sheet.id, (current) => {
                          const drafts = [...current.transformDrafts];
                          [drafts[index], drafts[index + 1]] = [drafts[index + 1], drafts[index]];
                          return { ...current, transformDrafts: drafts };
                        })
                      }
                      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurveSheet(sheet.id, (current) => ({
                          ...current,
                          transformDrafts: current.transformDrafts.filter((item) => item.id !== draft.id),
                        }))
                      }
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

        <PipelineTemplateControls
          sheetKind="curve"
          transformDrafts={sheet.transformDrafts}
          sanitizeDrafts={sanitizeTemplateDrafts}
          onReplace={(drafts) =>
            updateCurveSheet(sheet.id, (current) => ({
              ...current,
              transformDrafts: drafts,
            }))
          }
          onAppend={(drafts) =>
            updateCurveSheet(sheet.id, (current) => ({
              ...current,
              transformDrafts: [...current.transformDrafts, ...drafts],
            }))
          }
        />
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
          onClick={() => updateCurveSheet(sheet.id, applyCurvePipeline)}
          className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Apply Pipeline
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!sheet.transformDrafts.length}
            onClick={() => updateCurveSheet(sheet.id, (current) => ({ ...current, transformDrafts: [] }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Clear Steps
          </button>
          <button
            type="button"
            disabled={!sheet.curves.length}
            onClick={exportSelectedData}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Export Selected
          </button>
        </div>
      </div>
    </aside>
  );
}
