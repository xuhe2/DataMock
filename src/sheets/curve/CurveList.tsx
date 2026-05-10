import { useEffect, useRef, useState } from "react";
import { EditableGroupTag } from "../../components/EditableGroupTag";
import { groupItems } from "../../core/grouping";
import { useProjectStore } from "../../store/useProjectStore";
import type { Curve, CurveSheet } from "./types";

type CurveRowProps = {
  curve: Curve;
  checked: boolean;
  isActive: boolean;
  isReference: boolean;
  canDelete: boolean;
  onToggle: () => void;
  onSetActive: () => void;
  onSetReference: () => void;
  onRename: (name: string) => void;
  onChangeGroup: (group: string | undefined) => void;
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
  onRename,
  onChangeGroup,
  onDelete,
}: CurveRowProps) {
  const isGenerated = curve.meta?.kind === "generated";
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(curve.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(curve.name);
  }, [curve.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const saveName = () => {
    onRename(draftName);
    setDraftName((value) => value.trim() || curve.name);
    setIsEditing(false);
  };

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
          {isEditing ? (
            <input
              ref={inputRef}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={saveName}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveName();
                if (event.key === "Escape") setIsEditing(false);
              }}
              className="block w-full rounded border border-sky-300 bg-white px-1.5 py-0.5 text-sm font-medium text-slate-900 outline-none ring-2 ring-sky-100"
            />
          ) : (
            <button
              type="button"
              title="双击重命名"
              onDoubleClick={() => setIsEditing(true)}
              className="block max-w-full truncate text-left text-sm font-medium text-slate-900"
            >
              {curve.name}
            </button>
          )}
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
        <EditableGroupTag group={curve.group} onChange={onChangeGroup} />
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

type CurveListProps = {
  sheet: CurveSheet;
};

export function CurveList({ sheet }: CurveListProps) {
  const updateCurveSheet = useProjectStore((state) => state.updateCurveSheet);
  const generatedCount = sheet.curves.filter((curve) => curve.meta?.kind === "generated").length;
  const groupedCurves = groupItems(sheet.curves);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">曲线列表</h2>
        <span className="text-xs text-slate-500">
          {sheet.curves.length - generatedCount} Raw / {generatedCount} Generated
        </span>
      </div>

      <div className="space-y-3">
        {groupedCurves.map((group) => (
          <div key={group.name} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="truncate text-xs font-semibold text-slate-700">{group.name}</h3>
              <span className="text-[11px] text-slate-400">{group.items.length}</span>
            </div>
            {group.items.map((curve) => (
              <CurveRow
                key={curve.id}
                curve={curve}
                checked={sheet.selectedCurveIds.includes(curve.id)}
                isActive={curve.id === sheet.activeCurveId}
                isReference={curve.id === sheet.referenceCurveId}
                canDelete={sheet.curves.length > 1}
                onToggle={() =>
                  updateCurveSheet(sheet.id, (current) => {
                    const selected = current.selectedCurveIds.includes(curve.id);
                    return {
                      ...current,
                      selectedCurveIds: selected
                        ? current.selectedCurveIds.filter((id) => id !== curve.id)
                        : [...current.selectedCurveIds, curve.id],
                    };
                  })
                }
                onSetActive={() => updateCurveSheet(sheet.id, (current) => ({ ...current, activeCurveId: curve.id }))}
                onSetReference={() =>
                  updateCurveSheet(sheet.id, (current) => ({ ...current, referenceCurveId: curve.id }))
                }
                onRename={(name) =>
                  updateCurveSheet(sheet.id, (current) => ({
                    ...current,
                    curves: current.curves.map((item) =>
                      item.id === curve.id && name.trim() ? { ...item, name: name.trim() } : item,
                    ),
                  }))
                }
                onChangeGroup={(groupName) =>
                  updateCurveSheet(sheet.id, (current) => ({
                    ...current,
                    curves: current.curves.map((item) =>
                      item.id === curve.id ? { ...item, group: groupName } : item,
                    ),
                  }))
                }
                onDelete={() =>
                  updateCurveSheet(sheet.id, (current) => {
                    const curves = current.curves.filter((item) => item.id !== curve.id);
                    return {
                      ...current,
                      curves,
                      selectedCurveIds: current.selectedCurveIds.filter((id) => id !== curve.id),
                      activeCurveId: current.activeCurveId === curve.id ? curves[0]?.id : current.activeCurveId,
                      referenceCurveId: current.referenceCurveId === curve.id ? undefined : current.referenceCurveId,
                    };
                  })
                }
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
