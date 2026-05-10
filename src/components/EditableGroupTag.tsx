import { useEffect, useRef, useState } from "react";
import { getItemGroupName, normalizeGroupName } from "../core/grouping";

type EditableGroupTagProps = {
  group?: string;
  onChange: (group: string | undefined) => void;
};

export function EditableGroupTag({ group, onChange }: EditableGroupTagProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftGroup, setDraftGroup] = useState(group ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    setDraftGroup(group ?? "");
  }, [group]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const saveGroup = () => {
    if (cancelRef.current) {
      cancelRef.current = false;
      setDraftGroup(group ?? "");
      setIsEditing(false);
      return;
    }

    onChange(normalizeGroupName(draftGroup));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draftGroup}
        placeholder="Ungrouped"
        onChange={(event) => setDraftGroup(event.target.value)}
        onBlur={saveGroup}
        onKeyDown={(event) => {
          if (event.key === "Enter") saveGroup();
          if (event.key === "Escape") {
            cancelRef.current = true;
            setDraftGroup(group ?? "");
            setIsEditing(false);
          }
        }}
        className="h-6 w-24 rounded border border-sky-300 bg-white px-1.5 text-xs text-slate-900 outline-none ring-2 ring-sky-100"
      />
    );
  }

  return (
    <button
      type="button"
      title="双击修改分组"
      onDoubleClick={() => setIsEditing(true)}
      className="max-w-28 truncate rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700"
    >
      {getItemGroupName({ group })}
    </button>
  );
}
