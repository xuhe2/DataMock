import { CurveChart } from "./components/CurveChart";
import { CurveList } from "./components/CurveList";
import { DataImporter } from "./components/DataImporter";
import { ProjectControls } from "./components/ProjectControls";
import { TransformHistory } from "./components/TransformHistory";
import { TransformPanel } from "./components/TransformPanel";

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-slate-50">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          <ProjectControls />
          <DataImporter />
          <CurveList />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-white">
        <CurveChart />
        <TransformHistory />
      </main>

      <div className="w-[320px] shrink-0">
        <TransformPanel />
      </div>
    </div>
  );
}
