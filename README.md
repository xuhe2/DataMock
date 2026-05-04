# 数据曲线 Mock 工具

一个用于导入、展示和生成 Mock 曲线的 Web MVP。支持 JSON 粘贴、CSV 上传、ECharts 曲线对比、Transform Pipeline 和 Mock 数据导出。

## 功能

- 导入一组或多组曲线数据
- 同时展示原始曲线和 Mock 曲线
- 原始曲线使用实线，Mock 曲线使用虚线
- 支持 legend、tooltip、dataZoom
- 支持曲线显示 / 隐藏、active curve、reference curve
- 支持 Scale、Offset、Trend、Noise、Smooth、Reference Based 变换
- 支持多次 Apply 后基于上一次 Mock 继续叠加
- 支持 Reset 当前 Mock、Clear All Mock、导出 JSON

## 安装依赖

```bash
npm install
```

## 启动

```bash
npm run dev
```

构建生产包：

```bash
npm run build
```

## JSON 数据格式

JSON 顶层必须是曲线数组：

```json
[
  {
    "id": "curve_1",
    "name": "Baseline",
    "x": [1, 2, 3, 4, 5],
    "y": [0.2, 0.25, 0.28, 0.31, 0.35]
  },
  {
    "id": "curve_2",
    "name": "Experiment A",
    "x": [1, 2, 3, 4, 5],
    "y": [0.22, 0.27, 0.3, 0.35, 0.4]
  }
]
```

内部类型：

```ts
type Curve = {
  id: string;
  name: string;
  group?: string;
  x: Array<number | string>;
  y: number[];
  meta?: Record<string, any>;
};
```

## CSV 数据格式

CSV 第一列必须是 `x`，其余列会转换为独立曲线：

```csv
x,curve_1,curve_2,curve_3
1,0.2,0.22,0.18
2,0.25,0.27,0.21
3,0.28,0.30,0.25
```

## Mock Transform

- Scale: `newY = y * factor`
- Offset: `newY = y + value`
- Trend: 根据归一化索引按 up/down 添加趋势
- Noise: 使用 seeded random 生成可复现正态噪声
- Smooth: 使用移动平均
- Reference Based: 当前曲线和 reference curve 混合后做幅度调整和趋势调整

每次点击 `Apply Transform` 会生成或更新当前 active curve 的 Mock 曲线，不会修改原始曲线。同一条原始曲线多次 Apply 时会基于上一次 Mock 继续叠加。`Reset Mock` 会删除当前 active curve 的 Mock，使其回到只有原始曲线的状态。

## 后续可扩展方向

- 增加曲线插值，支持不同 x 轴长度和非对齐采样点
- 增加批量 transform 和 transform preset
- 支持更多噪声分布和异常点注入
- 支持导出 CSV
- 支持项目保存 / 加载
- 增加单元测试覆盖核心 transform 和 parser
