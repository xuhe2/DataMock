import Papa from "papaparse";
import type { Curve, DataMockProject } from "../types";

function parseXValue(value: unknown): number | string {
  const raw = String(value ?? "").trim();
  if (raw === "") return "";
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : raw;
}

function validateCurve(curve: unknown, index: number): Curve {
  if (!curve || typeof curve !== "object") {
    throw new Error(`第 ${index + 1} 条曲线不是有效对象`);
  }

  const candidate = curve as Partial<Curve>;
  if (!candidate.id || !candidate.name || !Array.isArray(candidate.x) || !Array.isArray(candidate.y)) {
    throw new Error(`第 ${index + 1} 条曲线缺少 id、name、x 或 y`);
  }

  if (candidate.x.length !== candidate.y.length) {
    throw new Error(`曲线 ${candidate.name} 的 x 和 y 长度不一致`);
  }

  const y = candidate.y.map((value, pointIndex) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      throw new Error(`曲线 ${candidate.name} 的第 ${pointIndex + 1} 个 y 值不是数字`);
    }
    return numeric;
  });

  return {
    id: String(candidate.id),
    name: String(candidate.name),
    group: candidate.group,
    x: candidate.x,
    y,
    meta: candidate.meta,
  };
}

export function parseProject(input: string): DataMockProject {
  const parsed: unknown = JSON.parse(input);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("项目文件不是有效对象");
  }

  const project = parsed as Partial<DataMockProject>;
  if (project.version !== 1) {
    throw new Error("不支持的项目文件版本");
  }

  if (!Array.isArray(project.curves)) {
    throw new Error("项目文件缺少 curves");
  }

  const curves = project.curves.map(validateCurve);
  const selectedCurveIds = Array.isArray(project.selectedCurveIds)
    ? project.selectedCurveIds.map(String)
    : curves.map((curve) => curve.id);
  const transformDrafts = Array.isArray(project.transformDrafts) ? project.transformDrafts : [];

  return {
    version: 1,
    name: project.name || "Untitled Project",
    curves,
    selectedCurveIds,
    activeCurveId: project.activeCurveId,
    referenceCurveId: project.referenceCurveId,
    transformDrafts,
    savedAt: project.savedAt || new Date().toISOString(),
  };
}

function parseNumberList(input: string, field: string): number[] {
  const normalized = input.trim();
  if (!normalized) {
    throw new Error(`${field} 不能为空`);
  }

  let values: unknown;
  if (normalized.startsWith("[")) {
    values = JSON.parse(normalized);
  } else {
    values = normalized.split(/[\s,]+/).filter(Boolean);
  }

  if (!Array.isArray(values)) {
    throw new Error(`${field} 必须是数组或数字列表`);
  }

  return values.map((value, index) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      throw new Error(`${field} 第 ${index + 1} 个值不是数字`);
    }
    return numeric;
  });
}

export function parseArrayCurve(name: string, yInput: string, xInput?: string): Curve {
  const y = parseNumberList(yInput, "y");
  const x = xInput?.trim()
    ? parseNumberList(xInput, "x")
    : y.map((_, index) => index + 1);

  if (x.length !== y.length) {
    throw new Error("x 和 y 长度不一致");
  }

  const trimmedName = name.trim() || "Imported Array";
  const id = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "array_curve";

  return {
    id,
    name: trimmedName,
    x,
    y,
    meta: {
      source: "array",
    },
  };
}

export function parseCsvCurves(input: string): Curve[] {
  const result = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(result.errors[0]?.message ?? "CSV 解析失败");
  }

  if (!result.data.length) {
    throw new Error("CSV 没有可用数据");
  }

  const fields = result.meta.fields ?? [];
  if (!fields.includes("x")) {
    throw new Error("CSV 必须包含 x 列");
  }

  const curveColumns = fields.filter((field) => field !== "x");
  if (curveColumns.length === 0) {
    throw new Error("CSV 至少需要包含一列曲线数据");
  }

  const rows = result.data.filter((row) => row.x !== undefined && String(row.x).trim() !== "");
  const x = rows.map((row) => parseXValue(row.x));

  return curveColumns.map((column) => {
    const y = rows.map((row, rowIndex) => {
      const numeric = Number(row[column]);
      if (!Number.isFinite(numeric)) {
        throw new Error(`CSV 第 ${rowIndex + 2} 行 ${column} 不是有效数字`);
      }
      return numeric;
    });

    return {
      id: column,
      name: column,
      x,
      y,
      meta: {
        source: "csv",
      },
    };
  });
}
