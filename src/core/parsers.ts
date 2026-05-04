import Papa from "papaparse";
import type { Curve } from "../types";

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

export function parseJsonCurves(input: string): Curve[] {
  const parsed: unknown = JSON.parse(input);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON 顶层必须是曲线数组");
  }

  return parsed.map(validateCurve);
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
