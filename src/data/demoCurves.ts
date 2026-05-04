import type { Curve } from "../types";

export const demoCurves: Curve[] = [
  {
    id: "baseline",
    name: "Baseline",
    group: "Demo",
    x: [1, 2, 3, 4, 5, 6, 7, 8],
    y: [0.2, 0.25, 0.28, 0.31, 0.35, 0.39, 0.42, 0.45],
  },
  {
    id: "experiment_a",
    name: "Experiment A",
    group: "Demo",
    x: [1, 2, 3, 4, 5, 6, 7, 8],
    y: [0.22, 0.27, 0.3, 0.35, 0.4, 0.44, 0.47, 0.52],
  },
  {
    id: "experiment_b",
    name: "Experiment B",
    group: "Demo",
    x: [1, 2, 3, 4, 5, 6, 7, 8],
    y: [0.18, 0.21, 0.25, 0.29, 0.34, 0.37, 0.43, 0.48],
  },
];
