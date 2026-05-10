import { useEffect, useRef, useState } from "react";
import { EditableGroupTag } from "../../components/EditableGroupTag";
import { HistogramIcon } from "../../components/HistogramIcon";
import { groupItems } from "../../core/grouping";
import { useProjectStore } from "../../store/useProjectStore";
import type { ScalarMetric, ScalarSheet } from "./types";

type ScalarRowProps = {
  metric: ScalarMetric;
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

function ScalarRow({
  metric,
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
}: ScalarRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(metric.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(metric.name);
  }, [metric.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const saveName = () => {
    onRename(draftName);
    setDraftName((value) => value.trim() || metric.name);
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
              {metric.name}
            </button>
          )}
          <span className="mt-0.5 block truncate text-xs text-slate-500">{metric.id}</span>
        </span>
      </label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
          {metric.meta?.kind === "generated" ? "Generated" : "Raw"}
        </span>
        <EditableGroupTag group={metric.group} onChange={onChangeGroup} />
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

type ScalarListProps = {
  sheet: ScalarSheet;
};

export function ScalarList({ sheet }: ScalarListProps) {
  const updateScalarSheet = useProjectStore((state) => state.updateScalarSheet);
  const generatedCount = sheet.metrics.filter((metric) => metric.meta?.kind === "generated").length;
  const groupedMetrics = groupItems(sheet.metrics);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">指标列表</h2>
        <span className="text-xs text-slate-500">
          {sheet.metrics.length - generatedCount} Raw / {generatedCount} Generated
        </span>
      </div>
      <div className="space-y-3">
        {groupedMetrics.map((group) => (
          <div key={group.name} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-700">
                <HistogramIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{group.name}</span>
              </h3>
              <span className="text-[11px] text-slate-400">{group.items.length}</span>
            </div>
            {group.items.map((metric) => (
              <ScalarRow
                key={metric.id}
                metric={metric}
                checked={sheet.selectedMetricIds.includes(metric.id)}
                isActive={metric.id === sheet.activeMetricId}
                isReference={metric.id === sheet.referenceMetricId}
                canDelete={sheet.metrics.length > 1}
                onToggle={() =>
                  updateScalarSheet(sheet.id, (current) => {
                    const selected = current.selectedMetricIds.includes(metric.id);
                    return {
                      ...current,
                      selectedMetricIds: selected
                        ? current.selectedMetricIds.filter((id) => id !== metric.id)
                        : [...current.selectedMetricIds, metric.id],
                    };
                  })
                }
                onSetActive={() =>
                  updateScalarSheet(sheet.id, (current) => ({ ...current, activeMetricId: metric.id }))
                }
                onSetReference={() =>
                  updateScalarSheet(sheet.id, (current) => ({ ...current, referenceMetricId: metric.id }))
                }
                onRename={(name) =>
                  updateScalarSheet(sheet.id, (current) => ({
                    ...current,
                    metrics: current.metrics.map((item) =>
                      item.id === metric.id && name.trim() ? { ...item, name: name.trim() } : item,
                    ),
                  }))
                }
                onChangeGroup={(groupName) =>
                  updateScalarSheet(sheet.id, (current) => ({
                    ...current,
                    metrics: current.metrics.map((item) =>
                      item.id === metric.id ? { ...item, group: groupName } : item,
                    ),
                  }))
                }
                onDelete={() =>
                  updateScalarSheet(sheet.id, (current) => {
                    const metrics = current.metrics.filter((item) => item.id !== metric.id);
                    return {
                      ...current,
                      metrics,
                      selectedMetricIds: current.selectedMetricIds.filter((id) => id !== metric.id),
                      activeMetricId: current.activeMetricId === metric.id ? metrics[0]?.id : current.activeMetricId,
                      referenceMetricId: current.referenceMetricId === metric.id ? undefined : current.referenceMetricId,
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
