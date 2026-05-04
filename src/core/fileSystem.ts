import type { DataMockProject } from "../types";

type FileSystemFileHandleLike = {
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type WindowWithFileSystemAccess = Window & {
  showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandleLike[]>;
  showSaveFilePicker?: (options?: unknown) => Promise<FileSystemFileHandleLike>;
};

export function supportsFileSystemAccess(): boolean {
  return Boolean((window as WindowWithFileSystemAccess).showOpenFilePicker);
}

export function downloadProject(project: DataMockProject): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.name || "untitled"}.datamock.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function openProjectFile(): Promise<{
  text: string;
  handle?: FileSystemFileHandleLike;
  filename: string;
}> {
  const fsWindow = window as WindowWithFileSystemAccess;
  if (!fsWindow.showOpenFilePicker) {
    throw new Error("当前浏览器不支持直接打开本地文件");
  }

  const [handle] = await fsWindow.showOpenFilePicker({
    types: [
      {
        description: "DataMock Project",
        accept: {
          "application/json": [".datamock.json", ".json"],
        },
      },
    ],
    multiple: false,
  });
  const file = await handle.getFile();

  return {
    text: await file.text(),
    handle,
    filename: file.name,
  };
}

export async function saveProjectFile(
  project: DataMockProject,
  existingHandle?: FileSystemFileHandleLike,
): Promise<FileSystemFileHandleLike | undefined> {
  const fsWindow = window as WindowWithFileSystemAccess;
  let handle = existingHandle;

  if (!handle) {
    if (!fsWindow.showSaveFilePicker) {
      downloadProject(project);
      return undefined;
    }

    handle = await fsWindow.showSaveFilePicker({
      suggestedName: `${project.name || "untitled"}.datamock.json`,
      types: [
        {
          description: "DataMock Project",
          accept: {
            "application/json": [".datamock.json", ".json"],
          },
        },
      ],
    });
  }

  const writable = await handle.createWritable();
  await writable.write(new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }));
  await writable.close();

  return handle;
}
