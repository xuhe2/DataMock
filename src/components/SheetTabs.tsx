import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";

export function SheetTabs() {
  const project = useProjectStore((state) => state.project);
  const setActiveSheet = useProjectStore((state) => state.setActiveSheet);
  const addSheet = useProjectStore((state) => state.addSheet);
  const renameSheet = useProjectStore((state) => state.renameSheet);
  const deleteSheet = useProjectStore((state) => state.deleteSheet);
  const [editingSheetId, setEditingSheetId] = useState<string>();
  const [draftName, setDraftName] = useState("");

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
        {project.sheets.map((sheet) => {
          const isActive = sheet.id === project.activeSheetId;

          return (
            <div
              key={sheet.id}
              className={[
                "flex shrink-0 items-center gap-1 rounded-md border px-2 py-1",
                isActive ? "border-sky-300 bg-white" : "border-slate-200 bg-slate-100",
              ].join(" ")}
            >
              {editingSheetId === sheet.id ? (
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={() => {
                    renameSheet(sheet.id, draftName);
                    setEditingSheetId(undefined);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      renameSheet(sheet.id, draftName);
                      setEditingSheetId(undefined);
                    }
                    if (event.key === "Escape") {
                      setEditingSheetId(undefined);
                    }
                  }}
                  className="w-28 rounded border border-sky-300 px-1 text-sm outline-none"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveSheet(sheet.id)}
                  onDoubleClick={() => {
                    setDraftName(sheet.name);
                    setEditingSheetId(sheet.id);
                  }}
                  className="max-w-32 truncate text-sm font-medium text-slate-800"
                  title="双击重命名 Sheet"
                >
                  {sheet.name}
                </button>
              )}
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase text-slate-600">
                {sheet.kind}
              </span>
              <button
                type="button"
                disabled={project.sheets.length <= 1}
                onClick={() => deleteSheet(sheet.id)}
                className="px-1 text-xs text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                x
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => addSheet("curve")}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        + Curve
      </button>
      <button
        type="button"
        onClick={() => addSheet("scalar")}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        + Scalar
      </button>
    </div>
  );
}
