import { useActiveSheet } from "../store/useProjectStore";
import { CurveSheetView } from "../sheets/curve/CurveSheetView";
import { ScalarSheetView } from "../sheets/scalar/ScalarSheetView";

export function ActiveSheetView() {
  const sheet = useActiveSheet();

  if (!sheet) {
    return <div className="p-6 text-sm text-slate-500">没有可用 Sheet。</div>;
  }

  if (sheet.kind === "scalar") {
    return <ScalarSheetView sheet={sheet} />;
  }

  return <CurveSheetView sheet={sheet} />;
}
