# CE-010 Runbook — UnknownComponent 兜底

> 目标：当 NodeDTO.type 指向未注册的 ComponentId 时，系统应有一致的“unknown 组件”兜底策略：
> - 运行态渲染/编辑流程不会崩溃
> - 数据不丢失（type/props 原样保留）
> - Inspector/Palette/Renderer 后续可基于同一约定显示“未知组件”提示

## 0. 规范性思思过程
- 任务理解：本 CE 不做完整 renderer，只建立 unknown 的协议与最小实现点，使后续 CE-013 渲染、CE-015 Inspector 接线可以复用。
- 风险：若把 unknown 兜底写在 renderer 层，会导致 editor/runtime 其他链路（导入、迁移、选择）在无 renderer 时无法稳定处理未知组件。
- 策略：优先在 core/model 或 core/registry 边界建立稳定的“resolve + fallback descriptor”能力；渲染层仅消费。

## 1. 需求与验收

### 核心需求
- 定义 unknown 组件的稳定标识与最小描述信息（不依赖 React）。
- 提供一个“把 NodeDTO 映射为可渲染/可编辑的组件描述”的入口（可先是纯函数），当 resolve miss 时返回 unknown 描述。
- 对 unknown 组件：
  - 保留原始 `componentId`（node.type）
  - 保留原始 props（只读展示/透传）
  - children 规则设为 none（保守）或 any（看后续渲染策略；本 CE 先保守 none）

### 验收标准
- `npm run check` 通过。
- 单元测试覆盖：
  - registry 未注册时 resolve -> unknown 描述
  - 注册后 resolve -> 正常描述
  - unknown 描述包含 original componentId

## 2. 实施方案（Tasks）

## Task 1 — 定义 UnknownComponent 的 core 约定
- 在 `src/core/registry/` 或 `src/core/model/` 新增 unknown 相关类型：
  - `UnknownComponentDescriptor`（包含 `originalComponentId: ComponentId` 等）
  - `ResolvedComponentDescriptor` union（known | unknown）
- 选择放置位置：优先 `src/core/registry/`（因为已存在 resolveComponent 边界）。

**Commit**
- `feat(ce-010): define unknown component descriptor`

## Task 2 — 增加 resolver：NodeDTO -> descriptor
- 新增纯函数：
  - `resolveNodeComponentDescriptor(registry, node)`
  - 若 `node.type === 'ROOT'`：按既有逻辑返回特殊/跳过（本 CE 可不处理 ROOT，直接让调用方处理）
  - 若 resolveComponent miss：返回 unknown descriptor
  - 若 found：返回 known descriptor（直接引用 registry item）

**Commit**
- `feat(ce-010): add node component descriptor resolver`

## Task 3 — 测试与回归面
- 新增 `src/core/registry/__tests__/unknownComponent.test.ts`（或并入现有 suite）覆盖：
  - 未注册 componentId -> unknown descriptor
  - 已注册 componentId -> known descriptor
  - unknown descriptor 保留 original id 与 props

**Commit**
- `test(ce-010): cover unknown component fallback`

## 3. 备注
- childrenPolicy：unknown 先默认 `none`，避免编辑器/renderer 在未知组件下出现不可控 children 行为；后续若需要可在 CE-013/CE-017 协商。
- 本 CE 只提供 core 级别兜底协议，不负责 UI 展示。
