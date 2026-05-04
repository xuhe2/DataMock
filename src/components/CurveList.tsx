import { useCurveStore } from "../store/useCurveStore";
import type { Curve, MockCurve } from "../types";

function isMockCurve(curve: Curve | MockCurve): curve is MockCurve {
  return "sourceCurveId" in curve;
}

type CurveRowProps = {
  curve: Curve | MockCurve;
  checked: boolean;
  isActive: boolean;
  isReference: boolean;
  onToggle: () => void;
  onSetActive?: () => void;
  onSetReference?: () => void;
};

function CurveRow({
  curve,
  checked,
  isActive,
  isReference,
  onToggle,
  onSetActive,
  onSetReference,
}: CurveRowProps) {
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
        {isMockCurve(curve) ? (
          <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">Mock</span>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export function CurveList() {
  const curves = useCurveStore((state) => state.curves);
  const mockCurves = useCurveStore((state) => state.mockCurves);
  const selectedCurveIds = useCurveStore((state) => state.selectedCurveIds);
  const activeCurveId = useCurveStore((state) => state.activeCurveId);
  const referenceCurveId = useCurveStore((state) => state.referenceCurveId);
  const toggleCurveVisible = useCurveStore((state) => state.toggleCurveVisible);
  const setActiveCurve = useCurveStore((state) => state.setActiveCurve);
  const setReferenceCurve = useCurveStore((state) => state.setReferenceCurve);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">曲线列表</h2>
        <span className="text-xs text-slate-500">
          {curves.length} 原始 / {mockCurves.length} Mock
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
            onToggle={() => toggleCurveVisible(curve.id)}
            onSetActive={() => setActiveCurve(curve.id)}
            onSetReference={() => setReferenceCurve(curve.id)}
          />
        ))}
      </div>

      {mockCurves.length ? (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          {mockCurves.map((curve) => (
            <CurveRow
              key={curve.id}
              curve={curve}
              checked={selectedCurveIds.includes(curve.id)}
              isActive={false}
              isReference={false}
              onToggle={() => toggleCurveVisible(curve.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
