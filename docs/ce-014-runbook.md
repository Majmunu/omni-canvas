# CE-014 Runbook — Overlay Layer 基础能力

> 目标：在 Canvas 渲染层之上提供一个独立的 Overlay Layer（DOM 层），用于后续的 selection/hover/drag/resize 等交互视觉反馈。
> 本 CE 先做“骨架 + 坐标基准 + 可挂载”，不做选择逻辑（CE-017）。

## 依赖
- CE-013：DOM Renderer 已可递归渲染（已）

## 设计要点
- Overlay 必须与 Canvas 使用同一 viewport/缩放基准（CE-016 会补齐 zoom/pan；此处先按 1:1）。
- Overlay layer 结构独立，避免侵入 NodeRenderer 的业务渲染。
- 每个渲染 node 已有 `data-node-id`，为后续测量/定位打基础。

## Task 1 — 新增 OverlayLayer 组件并挂载到 Canvas Area
- 新增 `src/renderer/overlay/OverlayLayer.tsx`
  - 绝对定位覆盖在 canvas root 上方
  - 暴露一个 `children` slot，后续 overlay items 在此渲染
- 调整 `src/App.tsx` 的 Canvas children：
  - 用一个 wrapper 包住 `CanvasRoot` + `OverlayLayer`
  - 结构建议：
    - `<div data-testid="canvas-stage" style="position:relative">`
      - `<CanvasRoot ... />`
      - `<OverlayLayer />`

**Acceptance**
- 页面上存在 overlay 根节点（`data-testid="overlay-layer"`）
- `npm run check` 通过

**Commit**
- `feat(ce-014): add overlay layer scaffold`

## Task 2 — 最小测试
- 新增测试：渲染 App 时 overlay layer 存在。

**Commit**
- `test(ce-014): cover overlay layer scaffold`
