import { useMemo, useState } from "react";
import type { PipelineTemplate, Sheet } from "../project/types";
import { useProjectStore } from "../store/useProjectStore";

type PipelineTemplateControlsProps<TDraft> = {
  sheetKind: Sheet["kind"];
  transformDrafts: TDraft[];
  sanitizeDrafts: (drafts: TDraft[]) => TDraft[];
  onReplace: (drafts: TDraft[]) => void;
  onAppend: (drafts: TDraft[]) => void;
};

export function PipelineTemplateControls<TDraft>({
  sheetKind,
  transformDrafts,
  sanitizeDrafts,
  onReplace,
  onAppend,
}: PipelineTemplateControlsProps<TDraft>) {
  const templates = useProjectStore((state) => state.project.pipelineTemplates);
  const savePipelineTemplate = useProjectStore((state) => state.savePipelineTemplate);
  const deletePipelineTemplate = useProjectStore((state) => state.deletePipelineTemplate);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const availableTemplates = useMemo(() => {
    return templates.filter((template) => template.sheetKind === sheetKind);
  }, [sheetKind, templates]);
  const selectedTemplate = availableTemplates.find((template) => template.id === selectedTemplateId);

  const applyTemplate = (mode: "replace" | "append") => {
    if (!selectedTemplate) return;

    const drafts = sanitizeDrafts(structuredClone(selectedTemplate.transformDrafts as TDraft[]));
    if (mode === "replace") {
      onReplace(drafts);
      return;
    }

    onAppend(drafts);
  };

  return (
    <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Pipeline Templates</h3>
        <p className="mt-1 text-xs text-slate-500">模板只会显示当前 Sheet 类型可用的 Pipeline。</p>
      </div>

      <div className="space-y-2">
        <input
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          placeholder="Template name"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
        <input
          value={templateDescription}
          onChange={(event) => setTemplateDescription(event.target.value)}
          placeholder="Description optional"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="button"
          disabled={!transformDrafts.length || !templateName.trim()}
          onClick={() => {
            savePipelineTemplate(sheetKind, templateName, templateDescription, transformDrafts as Sheet["transformDrafts"]);
            setTemplateName("");
            setTemplateDescription("");
          }}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Save as Template
        </button>
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-3">
        <select
          value={selectedTemplateId}
          onChange={(event) => setSelectedTemplateId(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">选择模板</option>
          {availableTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {selectedTemplate?.description ? (
          <div className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
            {selectedTemplate.description}
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={!selectedTemplate}
            onClick={() => applyTemplate("replace")}
            className="rounded-md bg-sky-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Replace
          </button>
          <button
            type="button"
            disabled={!selectedTemplate}
            onClick={() => applyTemplate("append")}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Append
          </button>
          <button
            type="button"
            disabled={!selectedTemplate}
            onClick={() => {
              if (selectedTemplate) {
                deletePipelineTemplate(selectedTemplate.id);
                setSelectedTemplateId("");
              }
            }}
            className="rounded-md border border-red-200 bg-white px-2 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
          >
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}
