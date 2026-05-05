import { useActiveSheet } from "../store/useProjectStore";
import { CurveTransformPanel } from "../sheets/curve/CurveTransformPanel";
import { ScalarTransformPanel } from "../sheets/scalar/ScalarTransformPanel";

export function ActiveTransformPanel() {
  const sheet = useActiveSheet();

  if (!sheet) {
    return <aside className="h-full border-l border-slate-200 bg-slate-50" />;
  }

  if (sheet.kind === "scalar") {
    return <ScalarTransformPanel sheet={sheet} />;
  }

  return <CurveTransformPanel sheet={sheet} />;
}
