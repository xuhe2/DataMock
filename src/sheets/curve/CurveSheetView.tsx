import { CurveChart } from "./CurveChart";
import { CurveTransformHistory } from "./CurveTransformHistory";
import type { CurveSheet } from "./types";

type CurveSheetViewProps = {
  sheet: CurveSheet;
};

export function CurveSheetView({ sheet }: CurveSheetViewProps) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div>
          <h1 className="text-base font-semibold text-slate-950">{sheet.name}</h1>
          <p className="text-xs text-slate-500">Raw 曲线为实线，Generated 和 Preview 曲线为虚线</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 bg-white p-3">
        <CurveChart sheet={sheet} />
      </div>
      <CurveTransformHistory sheet={sheet} />
    </section>
  );
}
