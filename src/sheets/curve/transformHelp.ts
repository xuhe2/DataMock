import type { TransformHelp } from "../../components/HelpHint";
import type { CurveTransformType } from "./types";

export const curveTransformHelp: Record<CurveTransformType, TransformHelp> = {
  scale: {
    title: "Scale",
    summary: "按比例放大或缩小整条曲线，适合模拟整体幅度变化。",
    formula: "newY = y * factor",
    params: [{ name: "factor", description: "倍率。大于 1 会整体放大，小于 1 会整体缩小。" }],
    notes: ["不会改变曲线形状，只改变 y 值幅度。"],
  },
  offset: {
    title: "Offset",
    summary: "把整条曲线向上或向下平移，适合模拟基线漂移。",
    formula: "newY = y + value",
    params: [{ name: "value", description: "平移量。正数上移，负数下移。" }],
  },
  trend: {
    title: "Trend",
    summary: "沿 x 轴逐渐增加或减少一个线性趋势。",
    formula: "delta = strength * i / (n - 1)",
    params: [
      { name: "strength", description: "趋势强度。数值越大，曲线尾部偏移越明显。" },
      { name: "direction", description: "趋势方向。up 表示逐渐上升，down 表示逐渐下降。" },
    ],
    notes: ["首个点基本不变，越靠后的点受趋势影响越大。"],
  },
  noise: {
    title: "Noise",
    summary: "加入可复现的随机扰动，适合模拟测量误差或自然波动。",
    formula: "newY = y + randomNormal(0, sigma)",
    params: [
      { name: "sigma", description: "噪声标准差。越大，波动越明显。" },
      { name: "seed", description: "随机种子。同一个 seed 会生成相同的噪声结果。" },
    ],
  },
  smooth: {
    title: "Smooth",
    summary: "使用移动平均降低局部波动，适合让曲线更平滑。",
    formula: "newY = average(window)",
    params: [{ name: "windowSize", description: "移动平均窗口大小。越大越平滑，但细节损失越多。" }],
    notes: ["边界点会使用可用范围内的窗口。"],
  },
  reference_based: {
    title: "Reference Based",
    summary: "让当前曲线向参考曲线靠近，并可叠加幅度和趋势调整。",
    formula: "blendedY = y * (1 - blend) + refY * blend",
    params: [
      { name: "referenceCurveId", description: "参考曲线。当前 active 曲线会按 blend 向它靠近。" },
      { name: "blend", description: "混合比例。0 只保留当前曲线，1 完全使用参考曲线。" },
      { name: "amplitudeFactor", description: "围绕均值调整振幅。大于 1 放大起伏，小于 1 压缩起伏。" },
      { name: "trendStrength", description: "额外线性趋势强度。正数让尾部更高，负数让尾部更低。" },
    ],
    notes: ["当前曲线和参考曲线长度不一致时，会按较短长度处理。"],
  },
};
