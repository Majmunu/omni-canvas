# CE-004 Runbook — 定义核心类型与 DTO

> 目标：在不引入后续实现细节（CE-005/006/009…）的前提下，为画布引擎 P0 定义 **最小但足够稳定** 的核心类型与 DTO（TypeScript），作为后续模块的共同依赖。

## Scope
- 定义基础 ID / DTO / TypeScript 类型：`NodeId`、`ComponentId`、`SavedDocument`、`RuntimeSchema` 等。
- 定义 nodes + childrenMap 的数据形态（**只定义结构与约束，不实现转换/操作函数**）。
- 明确“保存态 vs 运行态”的差异与约束（P0：不记录 viewport/platform/device/selection）。
- 可选：提供极小的类型守卫/断言工具（不引入 zod/io-ts）。

## Non-scope（本 CE 禁止）
- 不实现 nodes/childrenMap 的转换层与增删改（CE-005）。
- 不实现 EditorStore 六层结构与任何 Zustand store（CE-006）。
- 不实现 registry、renderer、selection、drag 等（后续 CE）。

## File locations（建议落点）
- `src/core/types/id.ts`：ID 类型
- `src/core/dto/node.ts`：Node / NodeProps / NodeType
- `src/core/dto/document.ts`：SavedDocument / RuntimeSchema / 版本号
- `src/core/dto/childrenMap.ts`：childrenMap 结构类型
- `src/core/assert.ts`（可选）：断言/类型守卫
- `src/core/index.ts`（可选）：统一 re-export

> 若当前目录结构不同，可在 Task 1 创建最小目录，但保持 `src/core/**` 作为后续引用根。

---

## Task 1 — 新增 core 类型目录与基础 ID 类型

**Goal**
- 建立 CE-004 的类型落点与导出策略；定义最常用的 ID branded types。

**Steps**
1. 创建 `src/core/types/`（或 `src/core/` 下的对应目录）。
2. 定义：
   - `type NodeId = string & { __brand: 'NodeId' }`
   - `type ComponentId = string & { __brand: 'ComponentId' }`
   - （可选）`type DocumentVersion = string & { __brand: 'DocumentVersion' }`
3. 提供最小工厂函数（可选）：`asNodeId(s: string): NodeId`（仅类型断言，不做运行时校验）。

**Acceptance**
- `npm run typecheck` 通过。

**Commit message**
- `feat(ce-004): add core id types`

---

## Task 2 — 定义 Node DTO（nodes 形态）

**Goal**
- 定义 Node 的最小结构，确保后续 renderer/inspector 可以依赖。

**Steps**
1. 在 `src/core/dto/node.ts` 定义：
   - `export type NodeType = ComponentId | 'ROOT'`（或等价表达）
   - `export type NodeProps = Record<string, unknown>`（P0 先宽松）
   - `export interface NodeDTO { id: NodeId; type: NodeType; props: NodeProps }`
2. 明确约束（写在注释或文档块）：
   - props 为可序列化 JSON 值（运行时不强校验）。
   - root 节点是否单独建模（与 SavedDocument 的 rootId 对齐）。

**Acceptance**
- `npm run typecheck` 通过。

**Commit message**
- `feat(ce-004): define node dto`

---

## Task 3 — 定义 childrenMap（层级真相=children 顺序）

**Goal**
- 定义层级关系数据结构：children 顺序即渲染层级真相（不使用 zIndex）。

**Steps**
1. 在 `src/core/dto/childrenMap.ts` 定义：
   - `export type ChildrenMap = Record<NodeId, NodeId[]>`
2. 写清楚约束：
   - `childrenMap[parentId]` 数组顺序 = 渲染顺序（后者覆盖前者）。
   - 若 key 不存在，视为无 children。
   - 不在本 CE 处理数据一致性（如 orphan/重复），只给出约定。

**Acceptance**
- `npm run typecheck` 通过。

**Commit message**
- `feat(ce-004): define childrenMap type`

---

## Task 4 — 定义 SavedDocument（保存态）

**Goal**
- 定义保存态文档结构，明确 P0 不记录的信息。

**Steps**
1. 在 `src/core/dto/document.ts` 定义：
   - `export interface SavedDocument { version: string; rootId: NodeId; nodes: Record<NodeId, NodeDTO>; childrenMap: ChildrenMap }`
2. 明确 P0 约束（写入类型注释或 README）：
   - **不包含** viewport/platform/device/selection。
   - 线性历史不在此结构体现（CE-008 再做）。

**Acceptance**
- `npm run typecheck` 通过。

**Commit message**
- `feat(ce-004): define SavedDocument dto`

---

## Task 5 — 定义 RuntimeSchema（运行态）+ 最小断言工具（可选）

**Goal**
- 定义运行态 schema（若与保存态一致也要明确），并提供极小的运行时断言工具给后续模块使用。

**Steps**
1. 在 `src/core/dto/document.ts` 增加：
   - `export interface RuntimeSchema { document: SavedDocument }`（或按需要拆分，关键是保持 P0 不包含 viewport/platform/device/selection）。
2. （可选）新增 `src/core/assert.ts`：
   - `export function assertNever(x: never): never { throw new Error('Unexpected: ' + String(x)) }`
   - `export function isRecord(value: unknown): value is Record<string, unknown> { ... }`（极简）
3. 确保 `src/core/index.ts` re-export（可选但推荐）。

**Acceptance**
- `npm run check` 通过（至少 `npm run typecheck` 必须通过）。

**Commit message**
- `feat(ce-004): define RuntimeSchema and core asserts`
