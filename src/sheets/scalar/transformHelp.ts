import type { TransformHelp } from "../../components/HelpHint";
import type { ScalarTransformType } from "./types";

export const scalarTransformHelp: Record<ScalarTransformType, TransformHelp> = {
  scale: {
    title: "Scale",
    summary: "按比例放大或缩小单个数值，适合模拟指标整体倍率变化。",
    formula: "newValue = value * factor",
    params: [{ name: "factor", description: "倍率。大于 1 放大，小于 1 缩小。" }],
  },
  offset: {
    title: "Offset",
    summary: "对单个数值增加或减少固定偏移量。",
    formula: "newValue = value + value",
    params: [{ name: "value", description: "偏移量。正数增加，负数减少。" }],
  },
  noise: {
    title: "Noise",
    summary: "加入可复现的随机扰动，适合模拟测量误差。",
    formula: "newValue = value + randomNormal(0, sigma)",
    params: [
      { name: "sigma", description: "噪声标准差。越大，扰动越明显。" },
      { name: "randomize", description: "启用后每次计算都使用非确定随机数，结果不会固定。" },
      { name: "seed", description: "随机种子。关闭 randomize 时，同一个 seed 会生成相同结果。" },
    ],
  },
  reference_based: {
    title: "Reference Based",
    summary: "让当前数值向参考数值靠近，并可进行幅度调整。",
    formula: "blended = value * (1 - blend) + refValue * blend",
    params: [
      { name: "referenceMetricId", description: "参考指标。当前 active 指标会按 blend 向它靠近。" },
      { name: "blend", description: "混合比例。0 只保留当前值，1 完全使用参考值。" },
      { name: "amplitudeFactor", description: "混合后额外乘以的倍率。" },
    ],
  },
};
