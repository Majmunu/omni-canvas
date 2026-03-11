# CE-018 Runbook — 从组件库拖入（P0 先做 Click-to-Add）

> 目标：让用户能从 Palette 把 Box/Text 节点加入到 document（先用“点击添加”实现最短闭环；拖拽作为同 CE 后续子任务或下一步增强）。

## Scope
- Palette 列表项支持 “Add” 行为：点击某组件 → 在选中 parent 下（或默认 root 下）新增一个节点。
- 新增节点后：
  - document 更新（nodes + childrenMap）
  - Canvas 立即渲染出新节点（DOM renderer 已有 BoxView/TextView）
  - selection 自动切到新节点（便于 Inspector 显示）

## Non-scope
- 真正的 drag & drop 手势（可作为 Task 4/5 增强）。
- Ghost layer、拖拽预览（CE-030）。
- 复杂插入规则（精确 drop index / hover target）先不做。

## Dependencies
- CE-011：内置组件 registry（Box/Text）。
- CE-006：EditorStore + addNode op。
- CE-017：选择系统（用于确定插入 parent / 插入后选中）。

## Acceptance
- 点击 Palette 的 Box/Text，可在 Canvas 区域看到对应节点出现。
- Inspector 显示新节点的 type/props；Layers tree 显示层级增加。
- `npm run check` 全绿。

---

## Task 1 — Palette 支持 click-to-add（最短闭环）

**Goal**
- 从 Palette 点击添加节点进 document。

**Steps**
1. PalettePanel：为每个组件按钮添加 onClick。
2. 决定 parentId：
   - 若有 `selectedNodeId` 且其节点允许 children（先放宽：都允许），则用它；否则使用 `document.rootId`。
3. 生成 node：
   - `id`: 新 NodeId（需要一个稳定的 id 生成器；若项目已有 util 则复用，否则先用 `crypto.randomUUID()` + asNodeId）。
   - `type`: componentId（box/text）
   - `props`: 最小默认 props（BoxView/TextView 需要的字段若有）
4. 调用 store `addNode({ parentId, node })`。
5. 插入后自动 `setSelectedNodeId(newId)`。

**Acceptance**
- 点击 Box/Text，Canvas 出现对应 DOM。
- `npm run check` 通过。

**Commit**
- `feat(ce-018): add node by clicking palette item`

---

## Task 2 — Layers/Inspector 回归验收 + 基础测试

**Goal**
- 固化“添加后可见 + 可选中”的闭环。

**Steps**
1. RTL 测试：
   - 点击 Palette 的 Box 按钮
   - 断言 Canvas 出现 node（可通过 node-unknown / BoxView 的 testid/文本）
   - 断言 Layers tree 出现额外项（或至少 Inspector selected type 变化）
2. `npm run check` 全绿。

**Commit**
- `test(ce-018): cover click-to-add from palette`

---

## Task 3 — 最小样式/可见性保障（必要时）

**Goal**
- 确保新添加节点在 Canvas 可肉眼辨识。

**Steps**
- 若 BoxView/TextView 默认不可见，补最小默认样式/props（例如 Box 默认宽高/背景）。

**Commit**
- `style(ce-018): ensure newly added nodes are visible`

---

## Task 4（可选增强）— Drag & Drop 原型（非必须）
- 使用 HTML5 DnD 或 pointer-based 自实现；在 overlay 显示 drop hint。

## Risks / Watchouts
- id 生成必须稳定且类型正确（NodeId brand）。
- addNode op 会同时更新 document/runtimeDocument；插入后 selection 切换别忘了。
- 若 parentId 不允许 children 的规则未来要收紧，先写 TODO。
