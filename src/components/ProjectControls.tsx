import { useRef, useState } from "react";
import { downloadProject, openProjectFile, saveProjectFile, supportsFileSystemAccess } from "../core/fileSystem";
import { parseProject } from "../core/parsers";
import { useProjectStore } from "../store/useProjectStore";

type FileHandle = Awaited<ReturnType<typeof saveProjectFile>>;

function projectNameFromFilename(filename: string): string {
  return filename.replace(/\.datamock\.json$/i, "").replace(/\.json$/i, "") || "Untitled Project";
}

export function ProjectControls() {
  const projectName = useProjectStore((state) => state.project.name);
  const newProject = useProjectStore((state) => state.newProject);
  const loadProject = useProjectStore((state) => state.loadProject);
  const getProjectSnapshot = useProjectStore((state) => state.getProjectSnapshot);
  const [fileHandle, setFileHandle] = useState<FileHandle>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const handleNewProject = () => {
    newProject();
    setFileHandle(undefined);
    setError(undefined);
    setMessage("已创建新项目");
  };

  const handleOpenProject = async () => {
    try {
      const result = await openProjectFile();
      const project = parseProject(result.text);
      loadProject({
        ...project,
        name: project.name === "Untitled Project" ? projectNameFromFilename(result.filename) : project.name,
      });
      setFileHandle(result.handle);
      setError(undefined);
      setMessage(`已打开 ${result.filename}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "打开项目失败");
      setMessage(undefined);
    }
  };

  const handleFallbackProjectImport = async (file: File | undefined) => {
    if (!file) return;

    try {
      const project = parseProject(await file.text());
      loadProject({
        ...project,
        name: project.name === "Untitled Project" ? projectNameFromFilename(file.name) : project.name,
      });
      setFileHandle(undefined);
      setError(undefined);
      setMessage(`已导入 ${file.name}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "导入项目失败");
      setMessage(undefined);
    }
  };

  const handleSave = async (saveAs: boolean) => {
    try {
      const nextHandle = await saveProjectFile(getProjectSnapshot(), saveAs ? undefined : fileHandle);
      setFileHandle(nextHandle);
      setError(undefined);
      setMessage(saveAs ? "已另存项目" : "已保存项目");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "保存项目失败");
      setMessage(undefined);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Project</h2>
        <p className="mt-1 truncate text-xs text-slate-500">{projectName}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleNewProject}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          New
        </button>
        <button
          type="button"
          onClick={() => {
            if (supportsFileSystemAccess()) {
              void handleOpenProject();
            } else {
              fallbackInputRef.current?.click();
            }
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => void handleSave(false)}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => void handleSave(true)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Save As
        </button>
      </div>

      <button
        type="button"
        onClick={() => downloadProject(getProjectSnapshot())}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Export Project
      </button>

      <input
        ref={fallbackInputRef}
        type="file"
        accept=".datamock.json,.json,application/json"
        className="hidden"
        onChange={(event) => void handleFallbackProjectImport(event.target.files?.[0])}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {message}
        </div>
      ) : null}
    </section>
  );
}
