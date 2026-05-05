import { useActiveSheet } from "../store/useProjectStore";
import { CurveList } from "../sheets/curve/CurveList";
import { ScalarList } from "../sheets/scalar/ScalarList";

export function ActiveDataList() {
  const sheet = useActiveSheet();

  if (!sheet) return null;

  if (sheet.kind === "scalar") {
    return <ScalarList sheet={sheet} />;
  }

  return <CurveList sheet={sheet} />;
}
