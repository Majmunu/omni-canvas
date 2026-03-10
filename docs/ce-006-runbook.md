# CE-006 Runbook — 落地 EditorStore 六层结构（Zustand）

> 目标：基于 CE-004/CE-005 已落地的 DTO 与纯函数 ops，建立一个可扩展但克制的 `EditorStore` skeleton，并完成最小 wiring，使后续 CE-015/016/017/008 可以在稳定边界上继续实现。

## Scope
- 使用 `React 18 + TypeScript + Zustand` 落地编辑器 store。
- 以 `SavedDocument`、`RuntimeSchema`、`nodes/childrenMap`、`addNode/moveNode/removeNode/replaceProps` 为核心数据基础。
- 明确六层结构、职责边界、最小 selector 与 action facade。
- 完成最小 wiring：应用启动后有默认空文档，壳层组件可读取 store 的基础信息。

## Non-scope（本 CE 禁止）
- 不实现 renderer / registry / drag & drop / selection 交互。
- 不实现真实历史栈，仅保留 CE-008 所需 placeholder。
- 不实现平台切换、设备外框、缩放算法，仅提供 UI/viewport 基础状态骨架。
- 不引入任何 UI 框架。

## 依赖基线
- `SavedDocument` 与 `RuntimeSchema` 已定义：`src/core/dto/document.ts`
- `nodes + childrenMap` 结构已定义：`src/core/dto/node.ts`、`src/core/dto/childrenMap.ts`
- 空文档工厂已存在：`src/core/model/document.ts`
- 文档 ops 已存在：`src/core/model/ops.ts`
- 当前 Zustand 仅有占位 `appStore`：`src/store/appStore.ts`

## 六层结构（职责边界）
1. **Document Layer**
   持有持久化真相：`SavedDocument`。所有结构性修改最终都回落到这一层。
2. **Runtime Layer**
   持有运行态镜像：`RuntimeSchema`。P0 允许先与 `SavedDocument` 同步，但必须单独建模，为后续派生缓存和 registry 适配留接口。
3. **Operation Layer**
   暴露 `loadDocument/resetDocument/addNode/moveNode/removeNode/replaceProps` 等 action facade。该层只编排 CE-005 纯函数，不直接混入 UI 逻辑。
4. **UI / Viewport Layer**
   持有编辑器本地 UI 状态，例如缩放值、平移偏移、面板开关、当前设备槽位。此层不写入 `SavedDocument`。
5. **Selection Layer**
   持有选择态 skeleton，例如 `selectedNodeId`、`hoveredNodeId`、`focusNodeId`。本 CE 只建骨架与清空/设置接口，不接入交互系统。
6. **History Placeholder Layer**
   持有 `past/future` 占位或 `canUndo/canRedo` 占位，以及 `markDocumentChanged` 一类钩子位。真实入栈/回退留给 CE-008。

## 建议目录落点
- 推荐主路径：`src/editor/store/`
- 建议文件：
  - `src/editor/store/types.ts`
  - `src/editor/store/documentSlice.ts`
  - `src/editor/store/runtimeSlice.ts`
  - `src/editor/store/uiSlice.ts`
  - `src/editor/store/selectionSlice.ts`
  - `src/editor/store/historySlice.ts`
  - `src/editor/store/actions.ts`
  - `src/editor/store/useEditorStore.ts`
  - `src/editor/store/selectors.ts`
- 兼容现状的最小迁移：
  - 若暂时不想一次性迁走 `src/store/appStore.ts`，可先让其 re-export `useEditorStore`，但目标形态仍应收敛到 `src/editor/store/**`。

---

## Task 1 — 建立 EditorStore 类型骨架与目录边界

**Goal**
- 为六层状态建立稳定的 TypeScript 契约，先把“有哪些状态、各自归属哪里”定义清楚。

**Steps**
1. 创建 `src/editor/store/` 目录及统一出口。
2. 在 `types.ts` 定义 `EditorStoreState`、各 slice state、各 slice action 接口。
3. 明确字段归属：
   - `document`: `SavedDocument`
   - `runtime`: `RuntimeSchema`
   - `ui`: `viewport/panels/device` 最小态
   - `selection`: skeleton
   - `history`: placeholder
4. 写明边界注释：
   - 文档持久化字段不得混入 `ui/selection/history`
   - `runtime` 不是 renderer registry 的实现位置
   - `history` 在 CE-006 不负责回放

**Acceptance**
- `EditorStore` 的六层字段与 action 接口在类型层完整可见。
- 目录结构不再依赖 `src/store/appStore.ts` 的计数器示例。
- `npm run check` 通过。

**Commit message**
- `feat(ce-006): scaffold editor store contracts`

---

## Task 2 — 落地 document/runtime 两层与基于 ops 的 action facade

**Goal**
- 让 store 以 CE-005 的纯函数为唯一文档变更入口，形成可测、可替换的 store action 边界。

**Steps**
1. 新建 `documentSlice.ts` 与 `runtimeSlice.ts`。
2. 初始化默认状态：
   - `document` 来自 `createEmptyDocument()`
   - `runtime` 初始与 `document` 对齐
3. 在 `actions.ts` 或 `useEditorStore.ts` 中实现：
   - `loadDocument(document)`
   - `resetDocument()`
   - `addNode(args)`
   - `moveNode(args)`
   - `removeNode(args)`
   - `replaceProps(args)`
4. 约束 action 行为：
   - 结构变更先更新 `document`
   - `runtime` 在本 CE 同步刷新
   - 不在 action 内掺入 selection/viewport 副作用，除非是最小必要的 reset

**Acceptance**
- 所有文档变更 action 都委托给 CE-005 纯函数实现。
- 默认启动后 store 内存在 `ROOT` 文档。
- `runtime.document` 与 `document` 的同步策略被明确实现。
- `npm run check` 通过。

**Commit message**
- `feat(ce-006): add document runtime store actions`

---

## Task 3 — 落地 ui/viewport、selection、history placeholder 三层

**Goal**
- 把编辑器会话态和未来扩展位先占住，避免后续 CE 把瞬时 UI 状态塞进文档层。

**Steps**
1. 在 `uiSlice.ts` 定义最小 UI 状态：
   - `zoom`
   - `viewportOffset`
   - `leftPanelOpen/rightPanelOpen`
   - `activeDevicePreset` 或等价占位
2. 在 `selectionSlice.ts` 定义最小骨架：
   - `selectedNodeId`
   - `hoveredNodeId`
   - `focusNodeId`
   - `clearSelection/setSelectedNode`
3. 在 `historySlice.ts` 定义 placeholder：
   - `canUndo`
   - `canRedo`
   - `historyRevision` 或 `dirtySince`
   - `pushHistorySnapshot` / `undo` / `redo` 先保留 no-op 或显式抛错注释
4. 明确 reset 策略：
   - `resetDocument` 时允许清空 selection/history placeholder
   - `ui` 默认保留或重置，需在注释中选定一种并保持一致

**Acceptance**
- `ui`、`selection`、`history` 都有独立 slice 与最小 action。
- 历史能力仅为占位，不出现假实现。
- 文档层、会话层、未来 history 层边界清晰。
- `npm run check` 通过。

**Commit message**
- `feat(ce-006): add editor ui selection history slices`

---

## Task 4 — 组合 Zustand store、selectors 与最小 wiring

**Goal**
- 提供单一 `useEditorStore` 入口，并把 App 接到真实 editor store，而不是示例 counter store。

**Steps**
1. 创建 `useEditorStore.ts`，用 Zustand 组合六层 state 和 actions。
2. 提供最小 selectors，例如：
   - `selectDocument`
   - `selectRootId`
   - `selectZoom`
   - `selectSelectedNodeId`
3. 替换 `src/store/appStore.ts` 的占位实现：
   - 删除计数器示例，或改成兼容 re-export
4. 在 `src/App.tsx` 完成最小 wiring：
   - 从 store 读取 `rootId/version` 或等价基础信息
   - 在状态栏/壳层文案中反映“文档已加载”
   - 不引入 renderer、不渲染节点树

**Acceptance**
- 应用入口使用真实 `EditorStore`。
- 组件能读取 store 的基础状态，不再依赖示例 store。
- wiring 仅限壳层显示，不越权实现 renderer/selection 交互。
- `npm run check` 通过。

**Commit message**
- `feat(ce-006): wire app shell to editor store`

---

## Task 5 — 补齐测试，锁定 CE-006 的边界与回归面

**Goal**
- 用最小但关键的测试覆盖 store skeleton，确保后续 CE 接入时不会破坏层次边界。

**Steps**
1. 新增 `src/editor/store/__tests__/useEditorStore.test.ts` 或等价测试文件。
2. 覆盖至少这些场景：
   - 初始化时有空文档与 `ROOT`
   - `addNode/moveNode/removeNode/replaceProps` 能通过 store action 生效
   - `resetDocument` 会同步刷新 `document/runtime`
   - `selection` 与 `history` placeholder 初始值正确
   - `ui` 状态更新不污染 `SavedDocument`
3. 若 `App` 文案依赖 store，补充最小 UI 测试或更新现有断言。

**Acceptance**
- store 层公共 action 有基础回归测试。
- 至少验证一次“UI 状态不进入 document”的边界。
- `npm run check` 通过。

**Commit message**
- `test(ce-006): cover editor store skeleton`

---

## 实施注意事项
- 文档变更必须经过 CE-005 纯函数，不要在 Zustand `set` 内手写 `nodes/childrenMap` 变换逻辑。
- `history` 在 CE-006 只允许做占位，不要提前实现半套 undo/redo。
- `selection` 只建 store 骨架，不做命中、框选、hover 计算。
- 如果要兼容未来 registry/renderer，优先把 `runtime` 保持为可替换容器，不要提前塞 registry cache。

## 统一验收
- 本 CE 所有 task 统一验收命令：`npm run check`

## 任务摘要
1. 建立 `EditorStore` 六层类型骨架与目录边界。
2. 接入 `SavedDocument` / `RuntimeSchema` 与 CE-005 ops action facade。
3. 落地 `ui`、`selection`、`history placeholder` 三层。
4. 组合 Zustand store 并把 App Shell 接到真实 store。
5. 用测试锁定初始化、action 更新、状态边界与最小 wiring。
