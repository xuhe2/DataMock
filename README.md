# 数据曲线 Mock 工具

一个用于导入、展示和生成 Mock 曲线的 Web MVP。支持本地 Project 文件、CSV / Array 数据导入、ECharts 曲线对比和 Transform Pipeline。

## 功能

- 使用 `.datamock.json` 保存和打开完整 Project
- 支持现代浏览器直接保存回本地文件，不支持时降级为下载文件
- 导入 CSV 或数字数组到当前 Project
- 同时展示原始曲线和 Mock 曲线
- Raw 曲线使用实线，Generated 曲线使用虚线
- 支持 legend、tooltip、dataZoom
- 支持曲线显示 / 隐藏、active curve、reference curve
- 支持 Scale、Offset、Trend、Noise、Smooth、Reference Based 变换
- 支持组合 Transform Pipeline，一次生成一条新曲线
- 生成曲线作为普通曲线进入曲线列表，可以继续作为 active/reference
- 支持双击重命名曲线、删除具体曲线、导出当前选中的曲线 JSON

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

## Project 文件

Project 文件用于保存完整工作状态，后缀建议使用 `.datamock.json`。它不是手动导入曲线的普通 JSON，而是应用自己的工程文件格式。

```json
{
  "version": 1,
  "name": "Demo Project",
  "curves": [],
  "selectedCurveIds": [],
  "activeCurveId": "baseline",
  "referenceCurveId": "experiment_a",
  "transformDrafts": [],
  "savedAt": "2026-05-04T00:00:00.000Z"
}
```

核心曲线类型：

```ts
type Curve = {
  id: string;
  name: string;
  group?: string;
  x: Array<number | string>;
  y: number[];
  meta?: {
    kind?: "raw" | "generated";
    sourceCurveId?: string;
    transforms?: Transform[];
    createdAt?: string;
    style?: {
      lineType?: "solid" | "dashed";
    };
    [key: string]: any;
  };
};
```

## Project 操作

- `New`: 创建空 Project。
- `Open`: 打开 `.datamock.json` Project 文件。
- `Save`: 如果浏览器支持 File System Access API，会保存回当前打开的本地文件；否则下载一个 Project 文件。
- `Save As`: 另存为新的 `.datamock.json` 文件。
- `Export Project`: 直接下载当前 Project 文件。

Chrome / Edge 等现代浏览器可以获得更接近 draw.io 的本地文件体验。其他浏览器会自动降级为文件上传和下载。

## CSV 数据格式

CSV 第一列必须是 `x`，其余列会转换为独立曲线并追加到当前 Project：

```csv
x,curve_1,curve_2,curve_3
1,0.2,0.22,0.18
2,0.25,0.27,0.21
3,0.28,0.30,0.25
```

## Array 数据格式

Array 导入适合只有一组数字的情况。`y` 支持 JSON 数组或逗号 / 空白分隔数字：

```txt
0.2, 0.25, 0.28, 0.31, 0.35
```

`x` 可以留空，留空时自动生成 `1..n`。如果填写 `x`，长度必须和 `y` 一致。

## Mock Transform

- Scale: `newY = y * factor`
- Offset: `newY = y + value`
- Trend: 根据归一化索引按 up/down 添加趋势
- Noise: 使用 seeded random 生成可复现正态噪声
- Smooth: 使用移动平均
- Reference Based: 当前曲线和 reference curve 混合后做幅度调整和趋势调整

右侧面板使用组合 Pipeline：

1. 选择 Transform 类型。
2. 点击 `Add Step` 加入 Pipeline。
3. 在 Pipeline 中编辑每个 step 的参数，也可以 `Up`、`Down`、`Delete` 调整顺序。
4. 点击 `Apply Pipeline`，基于当前 active curve 按顺序执行所有 step，并生成一条新的 Generated 曲线。

Generated 曲线不会覆盖原曲线，也不会单独放在 Mock 列表里。它会作为普通曲线进入左侧曲线列表，可以继续显示 / 隐藏、作为 active curve、作为 reference curve，或者通过 `Delete` 删除。

`Export Selected` 会导出当前勾选的曲线到 `selected-curves.json`。

## 后续可扩展方向

- 增加曲线插值，支持不同 x 轴长度和非对齐采样点
- 增加批量 transform 和 transform preset
- 支持更多噪声分布和异常点注入
- 支持导出 CSV
- 支持自动恢复未保存状态
- 增加单元测试覆盖核心 transform 和 parser
