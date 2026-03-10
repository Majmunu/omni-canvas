# CE-005 Runbook — 实现 nodes / childrenMap 与转换层（纯函数）

> 目标：基于 CE-004 的 DTO（NodeDTO / ChildrenMap / SavedDocument / RuntimeSchema），实现对 `nodes + childrenMap` 的 **纯函数操作层** 与最小校验/规范化工具，并为关键函数提供 vitest 覆盖。

## Scope
- 纯函数：创建空文档、add/remove/move、replaceProps 等（只变换 DTO，不引入 Zustand）。
- 轻量 validate/normalize：在边界处保证基本不变量（可选择“抛错”或“返回问题列表”）。
- 最小测试：覆盖最关键的结构变换与顺序语义。

## Non-scope（本 CE 禁止）
- 不引入 EditorStore / Zustand（CE-006）。
- 不做 Registry / Renderer / Selection / Drag（后续 CE）。
- 不做 history（CE-008）。

## File locations（建议）
- `src/core/model/document.ts`：createEmptyDocument / validateDocument / normalizeDocument
- `src/core/model/ops.ts`：addNode/removeNode/moveNode/replaceProps（纯函数）
- `src/core/model/__tests__/ops.test.ts`：关键用例

---

## Task 1 — 创建空文档与 root 初始化 helper

**Goal**
- 提供 `createEmptyDocument()`（或等价）生成最小可用 `SavedDocument`：包含 `ROOT` 节点、rootId、空 childrenMap、初始 version。

**Steps**
1. 新建 `src/core/model/document.ts`。
2. 实现 `createEmptyDocument(params?)`：
   - 生成 rootId（先用简单策略，如固定 `asNodeId('root')`，或注入 generator；P0 可固定）。
   - nodes 里包含 root NodeDTO（type='ROOT'，props={}）。
   - childrenMap[rootId] = []。
   - version 设置为常量（如 `'0.1.0'`）。

**Acceptance**
- `npm run check` 通过。

**Commit message**
- `feat(ce-005): add empty document factory`

---

## Task 2 — 定义最小不变量与 validate/normalize

**Goal**
- 把 P0 的关键不变量写清，并提供 `validateDocument(doc)`（返回问题列表或抛错）与 `normalizeDocument(doc)`（可选）。

**Steps**
1. 在 `document.ts` 增加：
   - rootId 必须存在于 nodes
   - childrenMap key 缺省语义（缺省=无 children）
   - childrenMap 引用的 childId 必须存在于 nodes（至少能检测）
2. 选择策略：
   - `validateDocument` 返回 `{ ok: boolean; errors: string[] }`（推荐）
   - `normalizeDocument` 仅做最小修正（例如补齐缺失的 childrenMap[rootId]）。

**Acceptance**
- `npm run check` 通过。

**Commit message**
- `feat(ce-005): add document validation helpers`

---

## Task 3 — 实现 addNode / removeNode（纯函数）

**Goal**
- 实现添加/删除节点的纯函数，维护 nodes 与 childrenMap 的一致性。

**Steps**
1. 新建 `src/core/model/ops.ts`。
2. 实现：
   - `addNode(doc, { parentId, node, index? }) => doc'`
   - `removeNode(doc, { nodeId }) => doc'`（P0 可定义为：删除 nodeId 及其子树；或仅删除单节点并将子节点提升/丢弃——需在注释里明确，推荐“删除子树”）
3. 处理边界：
   - parentId 不存在 → 返回错误（或 throw；保持一致）
   - index 缺省 → append

**Tests**
- 添加后 parent children 顺序正确。
- 删除后 nodes 不包含该节点；childrenMap 不再引用该节点。

**Acceptance**
- `npm run check` 通过。

**Commit message**
- `feat(ce-005): add addNode/removeNode operations`

---

## Task 4 — 实现 moveNode（层级真相=children 顺序）

**Goal**
- 实现节点在同父/跨父移动，明确“顺序即层级真相”。

**Steps**
1. 在 `ops.ts` 实现 `moveNode(doc, { nodeId, fromParentId, toParentId, toIndex })`。
2. 约束：
   - 不允许把节点移动到其子树（简单检测：遍历 childrenMap）。
   - fromParentId/toParentId 必须存在。

**Tests**
- 同父 reorder。
- 跨父移动后：从旧父移除、插入新父，顺序正确。

**Acceptance**
- `npm run check` 通过。

**Commit message**
- `feat(ce-005): add moveNode operation`

---

## Task 5 — 实现 replaceProps（Inspector 最小支撑）

**Goal**
- 提供最小 props 更新能力，供后续 Inspector（CE-015/26）使用。

**Steps**
1. 在 `ops.ts` 增加 `replaceProps(doc, { nodeId, props })`（全量替换）与（可选）`patchProps`（浅合并）。
2. 保持纯函数：返回新 doc。

**Tests**
- props 更新后 nodes[nodeId].props 变化，其他节点不变。

**Acceptance**
- `npm run check` 通过。

**Commit message**
- `feat(ce-005): add replaceProps operation`
