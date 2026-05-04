import { useCurveStore } from "../store/useCurveStore";
import type { Curve } from "../types";

type CurveRowProps = {
  curve: Curve;
  checked: boolean;
  isActive: boolean;
  isReference: boolean;
  canDelete: boolean;
  onToggle: () => void;
  onSetActive: () => void;
  onSetReference: () => void;
  onDelete: () => void;
};

function curveKindLabel(curve: Curve): string {
  return curve.meta?.kind === "generated" ? "Generated" : "Raw";
}

function CurveRow({
  curve,
  checked,
  isActive,
  isReference,
  canDelete,
  onToggle,
  onSetActive,
  onSetReference,
  onDelete,
}: CurveRowProps) {
  const isGenerated = curve.meta?.kind === "generated";

  return (
    <div
      className={[
        "rounded-md border p-2 transition",
        isActive ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900">{curve.name}</span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">{curve.id}</span>
        </span>
      </label>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className={[
            "rounded px-1.5 py-0.5 text-[11px] font-medium",
            isGenerated ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          {curveKindLabel(curve)}
        </span>
        <button
          type="button"
          onClick={onSetActive}
          className={[
            "rounded px-2 py-1 text-xs font-medium transition",
            isActive ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          ].join(" ")}
        >
          Active
        </button>
        <button
          type="button"
          onClick={onSetReference}
          className={[
            "rounded px-2 py-1 text-xs font-medium transition",
            isReference ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          ].join(" ")}
        >
          Reference
        </button>
        <button
          type="button"
          disabled={!canDelete}
          onClick={onDelete}
          className="rounded px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function CurveList() {
  const curves = useCurveStore((state) => state.curves);
  const selectedCurveIds = useCurveStore((state) => state.selectedCurveIds);
  const activeCurveId = useCurveStore((state) => state.activeCurveId);
  const referenceCurveId = useCurveStore((state) => state.referenceCurveId);
  const toggleCurveVisible = useCurveStore((state) => state.toggleCurveVisible);
  const setActiveCurve = useCurveStore((state) => state.setActiveCurve);
  const setReferenceCurve = useCurveStore((state) => state.setReferenceCurve);
  const deleteCurve = useCurveStore((state) => state.deleteCurve);
  const generatedCount = curves.filter((curve) => curve.meta?.kind === "generated").length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">曲线列表</h2>
        <span className="text-xs text-slate-500">
          {curves.length - generatedCount} Raw / {generatedCount} Generated
        </span>
      </div>

      <div className="space-y-2">
        {curves.map((curve) => (
          <CurveRow
            key={curve.id}
            curve={curve}
            checked={selectedCurveIds.includes(curve.id)}
            isActive={curve.id === activeCurveId}
            isReference={curve.id === referenceCurveId}
            canDelete={curves.length > 1}
            onToggle={() => toggleCurveVisible(curve.id)}
            onSetActive={() => setActiveCurve(curve.id)}
            onSetReference={() => setReferenceCurve(curve.id)}
            onDelete={() => deleteCurve(curve.id)}
          />
        ))}
      </div>
    </section>
  );
}
