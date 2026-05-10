# DataMock

一个用于导入、展示和生成 Mock 数据的 Web MVP。支持本地 Project 文件、多 Sheet、曲线数据 Mock、单值指标 Mock、ECharts 曲线对比和 Transform Pipeline。

## 功能

- 使用 `.datamock.json` 保存和打开完整 Project
- 支持现代浏览器直接保存回本地文件，不支持时降级为下载文件
- 一个 Project 内支持多张 Sheet，类似 Excel / draw.io 的工作方式
- Curve Sheet 支持 CSV 或数字数组导入
- Scalar Sheet 支持单个数值指标导入
- Curve Sheet 展示原始曲线和 Generated 曲线
- Scalar Sheet 使用指标卡片展示 Raw / Generated 数值
- Raw 曲线使用实线，Generated 曲线使用虚线
- 支持 legend、tooltip、dataZoom
- 支持 active / reference 选择
- Curve Transform: Scale、Offset、Trend、Noise、Smooth、Reference Based
- Scalar Transform: Scale、Offset、Noise、Reference Based
- Transform 和 Sheet 强关联，曲线和单值指标使用不同的 transform 实现
- 支持组合 Transform Pipeline，一次生成一条新数据
- Generated 数据作为普通数据进入当前 Sheet，可以继续作为 active/reference
- 支持双击重命名数据和 Sheet、删除具体数据、导出当前选中数据

## 安装依赖

```bash
npm install
```

## 启动

```bash
npm run dev
```

构建 Web 生产包：

```bash
npm run build
```

## 本地二进制运行

项目提供一个 Go + embed 的本地静态文件服务器。它会把 Vite 构建产物内嵌进 Go 二进制，启动后监听 `127.0.0.1:5179` 并自动打开浏览器。如果默认端口被占用，会自动回退到随机可用端口。

构建本地应用：

```bash
npm run build:app
```

运行：

```bash
./dist-app/datamock
```

指定端口：

```bash
./dist-app/datamock --port 5180
```

使用随机端口：

```bash
./dist-app/datamock --port 0
```

不自动打开浏览器：

```bash
./dist-app/datamock --no-open
```

终端会输出类似：

```txt
DataMock is running at http://127.0.0.1:5179
```

用户拿到对应平台的 `datamock` 二进制后，可以直接运行，不需要自己启动 Vite 或配置文件服务器。

## Project 文件

Project 文件用于保存完整工作状态，后缀建议使用 `.datamock.json`。它不是手动导入曲线的普通 JSON，而是应用自己的工程文件格式。

```json
{
  "version": 2,
  "name": "Demo Project",
  "activeSheetId": "curve_sheet_1",
  "sheets": [
    {
      "id": "curve_sheet_1",
      "name": "Curves",
      "kind": "curve",
      "curves": [],
      "selectedCurveIds": [],
      "transformDrafts": []
    },
    {
      "id": "scalar_sheet_1",
      "name": "Scalars",
      "kind": "scalar",
      "metrics": [],
      "selectedMetricIds": [],
      "transformDrafts": []
    }
  ],
  "pipelineTemplates": [],
  "savedAt": "2026-05-05T00:00:00.000Z"
}
```

旧版 `version: 1` Project 会自动迁移成 `version: 2`，并放入一张默认 Curve Sheet。

核心数据类型：

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

type ScalarMetric = {
  id: string;
  name: string;
  value: number;
  unit?: string;
  group?: string;
  meta?: {
    kind?: "raw" | "generated";
    sourceMetricId?: string;
    transforms?: ScalarTransform[];
    createdAt?: string;
  };
};
```

## Project 操作

- `New`: 创建空 Project。
- `Open`: 打开 `.datamock.json` Project 文件。
- `Save`: 如果浏览器支持 File System Access API，会保存回当前打开的本地文件；否则下载一个 Project 文件。
- `Save As`: 另存为新的 `.datamock.json` 文件。
- `Export Project`: 直接下载当前 Project 文件。
- `+ Curve`: 新增 Curve Sheet。
- `+ Scalar`: 新增 Scalar Sheet。

Chrome / Edge 等现代浏览器可以获得更接近 draw.io 的本地文件体验。其他浏览器会自动降级为文件上传和下载。

## CSV 数据格式

CSV 只能导入到 Curve Sheet。第一列必须是 `x`，其余列会转换为独立曲线并追加到当前 Sheet：

```csv
x,curve_1,curve_2,curve_3
1,0.2,0.22,0.18
2,0.25,0.27,0.21
3,0.28,0.30,0.25
```

## Array 数据格式

Array 只能导入到 Curve Sheet，适合一组 y 数字。`y` 支持 JSON 数组或逗号 / 空白分隔数字：

```txt
0.2, 0.25, 0.28, 0.31, 0.35
```

`x` 可以留空，留空时自动生成 `1..n`。如果填写 `x`，长度必须和 `y` 一致。

## Scalar 数据格式

Scalar Sheet 使用单个数值指标：

```txt
name: Conversion Rate
value: 0.128
unit: %
```

导入后会生成一个 `ScalarMetric`，并以指标卡片展示。

## Transform

Transform 按 Sheet 类型拆分实现，不再是全局通用模块。

Curve Sheet:

- Scale: `newY = y * factor`
- Offset: `newY = y + value`
- Trend: 根据归一化索引按 up/down 添加趋势
- Noise: 支持 seeded random 生成可复现正态噪声，也支持 randomize 模式生成每次不同的噪声
- Smooth: 使用移动平均
- Reference Based: 当前曲线和 reference curve 混合后做幅度调整和趋势调整

Scalar Sheet:

- Scale: `newValue = value * factor`
- Offset: `newValue = value + offset`
- Noise: 支持 seeded random 生成可复现正态噪声，也支持 randomize 模式生成每次不同的噪声
- Reference Based: 当前指标和 reference metric 混合后做幅度调整

右侧面板使用组合 Pipeline：

1. 选择 Transform 类型。
2. 点击 `Add Step` 加入 Pipeline。
3. 在 Pipeline 中编辑每个 step 的参数，也可以 `Up`、`Down`、`Delete` 调整顺序。
4. 点击 `Apply Pipeline`，基于当前 active 数据按顺序执行所有 step，并生成一条新的 Generated 数据。

Generated 数据不会覆盖原数据，也不会单独放在 Mock 列表里。它会作为普通数据进入当前 Sheet，可以继续显示 / 隐藏、作为 active、作为 reference，或者通过 `Delete` 删除。

`Export Selected` 会根据当前 Sheet 类型导出 `selected-curves.json` 或 `selected-metrics.json`。

## Pipeline Templates

Pipeline 模板保存在 Project 文件的 `pipelineTemplates` 中，随 `.datamock.json` 一起保存和打开。

- `Save as Template`: 将当前 Sheet 的 Pipeline 保存为模板。
- `Replace`: 使用模板替换当前 Pipeline。
- `Append`: 将模板步骤追加到当前 Pipeline 后面。
- `Delete`: 删除选中的模板。

模板按 Sheet 类型隔离：

- Curve 模板只能用于 Curve Sheet。
- Scalar 模板只能用于 Scalar Sheet。
- 模板保存的是 Transform steps，不保存 active/reference 数据本身。
- 如果模板里的 `referenceCurveId` 或 `referenceMetricId` 在当前 Sheet 不存在，应用模板时会自动清空该 reference，用户需要重新选择。

## 代码结构

Transform 与 Sheet 强关联：

```txt
src/sheets/curve/
  transforms.ts
  transformDefaults.ts
  transformHelp.ts
  CurveTransformPanel.tsx

src/sheets/scalar/
  transforms.ts
  transformDefaults.ts
  transformHelp.ts
  ScalarTransformPanel.tsx
```

Project 只负责文件和多 Sheet：

```txt
src/project/
  types.ts
  migrations.ts

src/store/
  useProjectStore.ts
```

## 后续可扩展方向

- 增加曲线插值，支持不同 x 轴长度和非对齐采样点
- 增加批量 transform 和 transform preset
- 支持更多噪声分布和异常点注入
- 支持导出 CSV
- 支持自动恢复未保存状态
- 增加 Table Sheet / Distribution Sheet
- 增加单元测试覆盖 sheet transforms、project migration 和 parser
