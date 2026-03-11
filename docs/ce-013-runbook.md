# CE-013 Runbook — DOM Renderer 递归渲染

> 目标：把 `SavedDocument(nodes + childrenMap + rootId)` 渲染到 EditorShell 的 Canvas Area。
> 本 CE 是 UI 密集区：UI 结构由 Gemini 提供方案；逻辑保持最小，仍以 `npm run check` 为硬验收。

## 依赖
- CE-005：nodes/childrenMap（已）
- CE-009/010/011：registry + unknown fallback + builtin registry（已）
- CE-002：EditorShell 画布区域（已）

## 设计约束
- renderer 只做 DOM/React 递归渲染，不引入复杂交互（选择/拖拽在 CE-017/018/019）。
- 未注册组件：使用 CE-010 的 unknown descriptor 兜底显示。
- 只渲染到 Canvas Area，不改现有五区布局。

## Task 1 — 增加最小 renderer 组件树并接入 App
- 新增组件（命名可按 Gemini 建议微调）：
  - `EditorCanvasRenderer`：读取 store（rootId/nodes/childrenMap） + registry（builtin）
  - `NodeRenderer`：递归渲染 node -> children
  - `BoxView`/`TextView`：最小 DOM 表现
  - `UnknownView`：unknown descriptor 的 DOM 表现
- 在 `src/App.tsx` 的 Canvas Area 内替换 placeholder，挂载 renderer。

**Acceptance**
- 初始空文档至少渲染 ROOT 的 children 容器（可为空）。
- `npm run check` 通过。

**Commit**
- `feat(ce-013): render document tree in canvas`

## Task 2 — 为 renderer 添加最小测试
- 新增测试：渲染 App 时，至少能看到 Canvas 内出现 renderer 根节点。
- 再加 1 个测试：注入一个包含 Box/Text 的最小 document（可通过 store 的 loadDocument）后，能看到对应文本/容器。

**Acceptance**
- `npm run check` 通过。

**Commit**
- `test(ce-013): cover dom renderer`

## 备注
- 若 DOM 结构影响后续 overlay/selection，需保持每个 node 输出稳定的 `data-node-id` 属性。
- 样式先最小化（仅可读），不追求视觉完整。
