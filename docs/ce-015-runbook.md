# CE-015 Runbook — Palette / Layers / Inspector 接线

> 目标：把左侧 Palette、右侧 Layers/Inspector 与 `EditorStore` 连通，形成“可看见组件库、可看见图层树、选中联动、空选中空态”的最小闭环，为 CE-017 选择系统与 CE-018 拖入做 UI/状态承载。

## Scope
- Palette：渲染可用组件列表（来自 registry / 或其最小视图），先不做拖拽（CE-018）。
- Layers：渲染文档结构树（至少 page→children），点击图层可触发 selection（本 CE 只做 store 层联动与 UI；复杂交互留给 CE-017）。
- Inspector：根据 selection 展示选中节点的最小信息（id/type/name/props 只读占位即可），空选中显示空态。

## Non-scope（本 CE 禁止）
- 不实现拖拽创建（CE-018）。
- 不实现 overlay 选择框/命中高亮（CE-017/后续）。
- 不实现属性编辑提交流程（CE-026）。
- 不实现图层重排（CE-021）。

## Dependencies
- CE-002：五区布局（Palette / Canvas / Layers / Inspector / Toolbar）已存在。
- CE-006：EditorStore 六层结构（含 selection skeleton/actions）。
- CE-013：DOM renderer 递归渲染（用于 Canvas 内容层已可渲染）。

## Acceptance（来自 docs 约束）
- 选中节点后 **Layers 与 Inspector 联动**。
- 空选中时展示 **稳定空态**。
- `npm run check` 全绿（format:check + lint + test + typecheck + build）。

## Implementation Notes / 约定
- UI 实现走“UI 用 Gemini”并行产出组件拆分与样式建议；最终以现有代码结构为准。
- 复杂逻辑（例如：从 nodes/childrenMap 生成层级树、selection action 设计）按“复杂逻辑用 Codex”执行，但必须保持小步提交与可测。
- 避免引入 UI 框架；沿用现有 CSS/结构约定。

---

## Task 1 — 为 CE-015 建立面板组件骨架与最小渲染

**Goal**
- 在现有五区布局中找到 Palette/Layers/Inspector 容器落点，落地三个 panel 组件文件（或目录），并保证渲染稳定。

**Steps**
1. 新建（或补齐）面板组件：
   - `src/editor/panels/PalettePanel.tsx`
   - `src/editor/panels/LayersPanel.tsx`
   - `src/editor/panels/InspectorPanel.tsx`
2. 在对应区域挂载，确保具备测试钩子（优先 role/aria-label；必要时 data-testid）：
   - Palette：`aria-label="Palette"`
   - Layers：`aria-label="Layers"`
   - Inspector：`aria-label="Inspector"`
3. 各 panel 先输出占位标题与空态容器。

**Acceptance**
- App 渲染后三块面板均可定位到。
- `npm run check` 通过。

**Commit**
- `feat(ce-015): scaffold palette/layers/inspector panels`

---

## Task 2 — Palette：接入 registry，渲染组件列表（只读）

**Goal**
- 让 Palette 可以展示“可用组件”列表，为 CE-018 拖入做 UI 承载。

**Steps**
1. 在 registry 层查找可枚举的组件清单来源（如无现成 API，补一个最小 `listComponents()` 或导出注册表 keys）。
2. PalettePanel 渲染列表项（button 或 listitem），展示：displayName / type。
3. 暂不做交互，仅保证可读、稳定。

**Acceptance**
- Palette 区域能看到至少 MVP 内置组件列表（CE-011）。
- 测试：断言列表存在且包含若干项。
- `npm run check` 通过。

**Commit**
- `feat(ce-015): render palette component list`

---

## Task 3 — Layers：从 document(nodes/childrenMap) 构建层级树并渲染（只读）

**Goal**
- Layers 展示当前文档的层级结构（至少 page 下 children），为 selection 联动打基础。

**Steps**
1. 复用/新增纯函数：`buildLayerTree(document|runtime)`：
   - 输入 nodes + childrenMap + rootId/pageId
   - 输出可渲染树（包含 id、type、children）
2. LayersPanel 渲染树（ul/li 或 div tree），每项具备可点击语义（button）。

**Acceptance**
- 默认空文档至少能显示 root/page 层级与占位。
- `npm run check` 通过。

**Commit**
- `feat(ce-015): render layers tree from document`

---

## Task 4 — Selection 联动：点击 Layers 更新 selection；Inspector 响应 selection

**Goal**
- 满足 CE-015 核心验收：选中节点后 Layers 与 Inspector 联动；空选中空态。

**Steps**
1. 在 EditorStore selection slice 上确认/补齐最小接口：
   - `selectedNodeId: string | null`
   - `setSelectedNodeId(id: string | null)`
2. LayersPanel：点击某个 layer item → `setSelectedNodeId(nodeId)`；提供清空入口（可选：点击空白/按钮）。
3. InspectorPanel：
   - `selectedNodeId === null` → 显示空态（例如“未选中任何节点”）
   - 否则从 store 的 document/runtime 里取 node，显示最小信息（id/type + JSON.stringify(props) 的只读占位）
4. LayersPanel：高亮 selected 项（CSS class/aria-selected）。

**Acceptance**
- 选中某 layer 后：Layers 高亮变化；Inspector 展示对应 node 信息。
- 空选中：Inspector 展示空态；Layers 无高亮。
- 测试覆盖：模拟点击 layer item 后断言 inspector 内容变化。
- `npm run check` 通过。

**Commit**
- `feat(ce-015): wire selection between layers and inspector`

---

## Task 5 — 测试与文档收尾

**Goal**
- 固化验收点，避免回归；为 CE-017/CE-018 提供稳定地基。

**Steps**
1. 增补/完善 `src/App.test.tsx`（或对应测试文件）：
   - Palette/Layers/Inspector 存在
   - 点击 Layers 项 → Inspector 联动
   - 空选中空态稳定
2. 如需，补齐 aria-label/data-testid 约定。

**Acceptance**
- `npm run check` 通过。

**Commit**
- `test(ce-015): cover palette/layers/inspector wiring`

---

## Risks / Watchouts
- 不要把 CE-017 的 pointer hit-test、overlay selection 逻辑偷跑到 CE-015。
- Layers tree 生成必须是纯函数，避免 UI 里边算边改 store。
- 避免把 UI 会话态写入 document 层；selection 属于 selection slice。
- 工作区存在 `.ccw/ .workflow/ .tmp_*` 等运行态目录/文件，严禁误提交。
