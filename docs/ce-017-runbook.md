# CE-017 Runbook — 选择系统（Selection）

> 目标：在 EditorStore 上实现 P0 选择系统（单选/清空为主），并用 OverlayLayer 承载最小视觉反馈占位。该 CE 为后续 CE-018（拖入）与 CE-019（移动）提供交互基础。

## Scope
- Selection state：`selectedNodeId`（单选）+ `hoveredNodeId`（可选占位）。
- 交互：
  - 点击 Layers 列表项可选中（已在 CE-015 完成，作为验收基线保留）。
  - 点击 Canvas 内容节点可选中（新增）。
  - 点击空白处清空选中（新增）。
  - Esc 清空选中（新增，基于 document-level keydown）。
- Overlay：
  - 基于 `selectedNodeId`，在 overlay 上展示一个最小选中提示（例如角标/label 占位）。
  - 选中框/命中高亮的精确 bbox 测量先不做（可作为后续 CE 的增强）。

## Non-scope（本 CE 禁止）
- 多选、框选（marquee）、Ctrl+A 全选（可在后续扩展或拆子任务）。
- 组隔离（isolationStack）细则、锁定/隐藏不可选规则（先留接口与 TODO）。
- 拖拽选择/移动复制（CE-019）。

## Dependencies
- CE-014：OverlayLayer scaffold（已）。
- CE-015：Palette/Layers/Inspector 接线（已，含 selection store 基线）。

## Acceptance（来自 docs 约束）
- 点击 Canvas 节点可更新 selection。
- 点击空白区域或按 Esc 可清空 selection。
- selection 变化时 Layers 高亮与 Inspector 联动仍然成立（回归保护）。
- `npm run check` 全绿。

---

## Task 1 — Canvas 节点点击选中（DOM renderer hit via data-node-id）

**Goal**
- 让 Canvas 内容层的 DOM 节点可被点击选中，并写入 `selectedNodeId`。

**Steps**
1. 在 DOM renderer 的节点容器上确认 `data-node-id` 已存在（CE-013 已有）。
2. 在 CanvasRoot 外层（或 Canvas stage）注册 click handler：
   - 从事件 target 向上查找最近的 `[data-node-id]`。
   - 命中则 `setSelectedNodeId(nodeId)`。
   - 注意 overlay pointerEvents:none，不应阻断。

**Acceptance**
- 点击 canvas 中 root 节点区域后，Inspector 显示 Selected/Type。
- `npm run check` 通过。

**Commit**
- `feat(ce-017): select node by clicking canvas`

---

## Task 2 — 点击空白清空选中 + Esc 清空选中

**Goal**
- 提供清空路径，避免“选中粘住”。

**Steps**
1. Canvas stage click handler：若未命中任何 `[data-node-id]`，调用 `clearSelection()`。
2. 在 App/EditorShell 注册 `keydown`（Esc）事件：
   - 按 Esc 调用 `clearSelection()`。
   - 确保不与输入框冲突（若后续出现 input，可加条件）。

**Acceptance**
- 点击空白/按 Esc 后 Inspector 回到空态。
- `npm run check` 通过。

**Commit**
- `feat(ce-017): clear selection on blank click and escape`

---

## Task 3 — Overlay 最小选中提示占位

**Goal**
- 让选择系统在视觉上有反馈，并验证 overlay 与 selection wiring。

**Steps**
1. 扩展 `OverlayLayer` 支持渲染一个简单的 selection badge：
   - 若 `selectedNodeId !== null`，渲染一段文本/小标签（例如右上角固定位置）显示 selected id。
2. 保持 overlay 不接管 pointer events。

**Acceptance**
- 选中后 overlay 出现提示；清空后消失。
- `npm run check` 通过。

**Commit**
- `feat(ce-017): show minimal selection hint in overlay`

---

## Task 4 — 测试收口（回归 + 新增）

**Goal**
- 固化 CE-017 验收点，防止后续 DnD/viewport 改动破坏 selection。

**Steps**
1. App 测试：
   - 点击 layers root 按钮 → Inspector 有 Selected
   - 点击 canvas root node（通过 testid/node-root）→ Inspector 有 Selected
   - 点击 canvas-stage 空白处 → Inspector 回空态
   - 触发 keydown Escape → Inspector 回空态
2. 维持 `npm run check` 全绿。

**Commit**
- `test(ce-017): cover selection interactions`

---

## Risks / Watchouts
- 事件委托要稳：用 `closest('[data-node-id]')` 而非依赖具体 DOM 层级。
- 不要在本 CE 引入 bbox 测量与选中框绘制细节，避免拖慢到 CE-018。
- 浏览器扩展注入全局样式会影响观感，但不应影响交互验收（我们以测试与可访问语义为准）。
