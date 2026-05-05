import type { CurveSheet, CurveTransform, CurveTransformDraft } from "./types";

type HistoryItem = CurveTransform | CurveTransformDraft;

type CurveTransformHistoryProps = {
  sheet: CurveSheet;
};

export function CurveTransformHistory({ sheet }: CurveTransformHistoryProps) {
  const activeCurve = sheet.curves.find((curve) => curve.id === sheet.activeCurveId);
  const savedTransforms = activeCurve?.meta?.transforms ?? [];
  const items: HistoryItem[] = savedTransforms.length ? savedTransforms : sheet.transformDrafts;
  const title = savedTransforms.length ? "Generated History" : "Draft Pipeline";

  return (
    <section className="border-t border-slate-200 bg-slate-50 px-5 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{items.length} steps</span>
      </div>
      {items.length ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((transform, index) => (
            <div
              key={transform.id}
              className="min-w-[180px] rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-700"
            >
              <div className="mb-1 font-semibold text-slate-900">
                {index + 1}. {transform.type}
              </div>
              <pre className="max-h-20 overflow-auto whitespace-pre-wrap leading-4">
                {JSON.stringify(transform.params, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-500">当前没有 Transform step。</div>
      )}
    </section>
  );
}
