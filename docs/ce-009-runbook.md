# CE-009 Runbook — Registry 注册协议与查询 API

> 目标：基于 CE-004 的 DTO/类型体系，落地一个不依赖 React UI 与 renderer 的 registry 核心层，使组件定义、能力声明、迁移钩子与查询 API 有统一入口，并为 CE-010/CE-011/CE-013 提供稳定边界。

## 0. 规范性思考过程
- 任务理解：本 CE 只实现 registry 的类型、注册协议、查询 API 与最小示例，不实现 renderer、不接 UI 框架。
- 标准识别：需匹配现有 `src/core/**` 的纯类型/纯模型分层；引擎层不应硬编码组件字典；后续 unknown fallback、内置组件注册、DOM renderer 都要复用同一协议。
- 风险分析：若 registry 放进 `editor`，后续 `renderer` 与导出链路会反向依赖编辑器层；若协议中混入 React 组件类型，会提前把 CE-013 的渲染实现耦合进来。
- 验证计划：类型边界、重复注册行为、缺失查询语义、最小迁移入口、示例注册与测试都必须可由 `npm run check` 统一验收。
- 执行策略：先定目录与核心契约，再实现 registry factory/query API，再补示例定义与测试，最后统一出口与文档化约束。

## 1. 需求分析与验证

### 核心需求
- 提供 registry 类型定义：组件元数据、能力声明、迁移接口、查询结果。
- 提供统一注册协议：内置组件与未来扩展组件走同一 `register` 入口。
- 提供查询 API：至少覆盖 `register/get/has/list/migrate` 或等价能力。
- 提供最小示例：`Box`、`Text` 等仅定义 shape/capabilities，不做实际渲染。
- 为 CE-010 UnknownComponent、CE-011 内置组件注册、CE-013 DOM Renderer 预留稳定接口。

### 隐式约束
- 技术栈限定为 `React 18 + TypeScript`，但本 CE 不应依赖 React 组件实现。
- 不引入 UI 框架。
- 不把运行时临时状态写入 registry。
- 不触碰 `.ccw/`、`.workflow/`、`.tmp_*`。

### 边界条件
- 重复注册同一 `ComponentId` 时，必须有显式策略：抛错或返回失败结果，不能静默覆盖。
- 查询缺失组件时，必须保留原始 `componentId`，便于 CE-010 生成 unknown descriptor。
- 迁移能力在本 CE 只需协议与调用入口，不需要完成具体平台迁移规则。
- `ROOT` 不是可注册业务组件，registry 不负责注册 `ROOT`。

### 验证标准
- 引擎层可在无 renderer 的情况下独立创建 registry 并完成注册/查询。
- `Box`、`Text` 示例定义可通过 registry 被读取。
- 缺失查询与重复注册行为可测试且可预测。
- 统一验收命令为 `npm run check`。

## 2. 标准与模式分析

### 现有模式与证据
- `NodeType` 已明确把组件节点映射到 `ComponentId`，并注释说明注册组件从 CE-009 起接入：`src/core/dto/node.ts:6`
- `RuntimeSchema` 当前保持为独立类型，以便后续演化而不破坏持久化边界：`src/core/dto/document.ts:18`
- `EditorStore` 已把文档与运行态分层，说明 registry 更适合作为独立核心层，而不是 `editor/store` 的子模块：`src/editor/store/types.ts:13`
- `src/core/index.ts:1` 当前聚合纯核心导出，适合追加 registry 出口，避免上层反向依赖编辑器实现。

### 目录选择
- 选择：`src/core/registry/**`
- 理由：
  - registry 是引擎核心协议，不依赖 React 组件树、store 或编辑器 UI。
  - CE-010 UnknownComponent 与 CE-013 DOM Renderer 都需要消费 registry，但两者不应依赖 `src/editor/**`。
  - CE-012 平台映射/迁移、CE-029 导入导出也更接近 core/runtime 侧能力。
- 一致性要求：CE-009 全量文件均收敛在 `src/core/registry/**`，由 `src/core/index.ts` 统一 re-export。

## 3. 详细实施方案

## Task 1 — 建立 registry 目录与核心协议类型

**Goal**
- 定义 registry 的稳定类型边界，避免后续 CE 继续改协议。

**Steps**
1. 创建 `src/core/registry/` 目录与 `index.ts`。
2. 在 `types.ts` 定义核心接口：
   - `ComponentCapabilityFlags`
   - `ComponentRegistryItem`
   - `ComponentMigrationContext`
   - `ComponentMigrationResult`
   - `ComponentRegistryQuery`
3. 明确字段最小集合：
   - `componentId`
   - `displayName`
   - `category`
   - `defaultProps`
   - `allowedChildTypes` 或等价 children policy
   - `capabilities`
   - `migrate?`
4. 注释约束：
   - 不放 React component/render function
   - 不承担 UnknownComponent UI 呈现
   - 不注册 `ROOT`

**Acceptance**
- `src/core/registry/types.ts` 可独立表达 registry 协议。
- 类型命名与现有 `src/core/dto/**`、`src/core/types/**` 风格一致。
- `npm run check` 通过。

**Commit message**
- `feat(ce-009): define registry contracts`

## Task 2 — 实现 registry factory 与注册/查询 API

**Goal**
- 提供纯 TypeScript registry 实例，支持统一注册入口与稳定查询语义。

**Steps**
1. 新建 `createRegistry.ts` 或等价文件，实现工厂函数：
   - `createComponentRegistry()`
2. 暴露最小 API：
   - `register(item: ComponentRegistryItem): void`
   - `registerMany(items: ComponentRegistryItem[]): void`
   - `get(componentId: ComponentId): ComponentRegistryItem | undefined`
   - `require(componentId: ComponentId): ComponentRegistryItem`
   - `has(componentId: ComponentId): boolean`
   - `list(): ComponentRegistryItem[]`
3. 明确异常策略：
   - 重复注册抛出带 `componentId` 的错误
   - `require` 查询缺失时抛出可读错误
4. 保持实现纯净：
   - 不引入全局单例
   - 不依赖 store、React 或 DOM

**Acceptance**
- 内置组件与扩展组件未来都可调用同一组注册/查询 API。
- registry 行为纯内存、可测试、可多实例化。
- 重复注册与缺失查询有确定语义。
- `npm run check` 通过。

**Commit message**
- `feat(ce-009): add component registry api`

## Task 3 — 实现迁移查询协议与 Unknown fallback 所需元信息

**Goal**
- 把 CE-010/CE-012 需要的接口位一次建好，避免后续破坏注册协议。

**Steps**
1. 在 registry item 上定义可选 `migrate` 钩子签名。
2. 增加查询辅助函数：
   - `resolve(componentId)`：返回 `{ found: true, item } | { found: false, componentId }`
   - `migrateNode(node, context)`：若已注册且存在 `migrate` 则执行，否则原样返回
3. 保证 unknown 路径不丢数据：
   - 缺失组件时不改写 node 的 `type` 与 `props`
4. 用类型而非 UI 约束 CE-010：
   - 让 fallback 可基于 `resolve` 的 miss result 构建占位模型

**Acceptance**
- registry query 可区分“缺失”与“已注册但无需迁移”。
- `migrateNode` 对未注册组件是透明 no-op。
- CE-010/CE-012 能直接复用结果类型，不必再改 CE-009 核心协议。
- `npm run check` 通过。

**Commit message**
- `feat(ce-009): add registry resolve and migration hooks`

## Task 4 — 提供内置示例定义与统一出口

**Goal**
- 用最小示例验证协议可承载后续内置组件注册，但不越权实现真正的 CE-011。

**Steps**
1. 在 `src/core/registry/examples.ts` 或 `builtinSamples.ts` 定义最小示例：
   - `boxRegistryItem`
   - `textRegistryItem`
2. 仅描述 shape/capabilities：
   - `Box` 支持 children
   - `Text` 不支持 children，声明文本编辑能力
3. 在 `src/core/registry/index.ts` 与 `src/core/index.ts` 暴露类型、工厂、查询辅助、示例定义。
4. 明确文档边界：
   - 示例仅为协议验证样本
   - 真正 MVP 内置组件批量注册在 CE-011 完成

**Acceptance**
- 外部可直接从 `src/core` 导入 registry 核心 API 与最小样例。
- `Box` / `Text` 示例不包含 renderer 实现。
- 为 CE-011 提供“注册什么”的参考形态，但不提前批量落内置全集。
- `npm run check` 通过。

**Commit message**
- `feat(ce-009): add sample registry definitions`

## Task 5 — 补齐测试并锁定接口回归面

**Goal**
- 以测试锁定 registry 协议与异常语义，避免后续 CE 修改核心边界。

**Steps**
1. 新增 `src/core/registry/__tests__/createRegistry.test.ts` 或等价文件。
2. 覆盖至少以下场景：
   - 可注册并查询 `Box` / `Text`
   - `registerMany` 顺序注册成功
   - 重复注册抛错
   - `get/has/require/resolve` 在缺失组件时行为正确
   - `migrateNode` 对未注册组件保持透明，对已注册组件可调用迁移钩子
3. 若需要，补充 `src/core/index.ts` 导出面测试或类型使用测试。

**Acceptance**
- registry 的公共 API 都有直接测试覆盖。
- 异常路径和边界条件被显式验证。
- `npm run check` 通过。

**Commit message**
- `test(ce-009): cover registry protocol and queries`

## 4. 实施细节与代码

### 关键文件路径建议
- `src/core/registry/types.ts`
- `src/core/registry/createRegistry.ts`
- `src/core/registry/examples.ts`
- `src/core/registry/index.ts`
- `src/core/registry/__tests__/createRegistry.test.ts`
- `src/core/index.ts`

### 最小 API 形态

```ts
import type { NodeDTO } from '../dto/node'
import type { ComponentId } from '../types/id'

export interface ComponentCapabilityFlags {
  canHaveChildren: boolean
  isTextEditable?: boolean
  supportsStyleProps?: boolean
}

export interface ComponentMigrationContext {
  fromVersion?: string
  toVersion: string
  platform?: string
}

export interface ComponentMigrationResult {
  node: NodeDTO
  migrated: boolean
}

export interface ComponentRegistryItem {
  componentId: ComponentId
  displayName: string
  category: 'layout' | 'content' | 'basic' | 'custom'
  defaultProps: Record<string, unknown>
  allowedChildTypes: 'none' | 'any' | ComponentId[]
  capabilities: ComponentCapabilityFlags
  migrate?: (node: NodeDTO, context: ComponentMigrationContext) => ComponentMigrationResult
}

export interface ComponentRegistry {
  register: (item: ComponentRegistryItem) => void
  registerMany: (items: ComponentRegistryItem[]) => void
  get: (componentId: ComponentId) => ComponentRegistryItem | undefined
  require: (componentId: ComponentId) => ComponentRegistryItem
  has: (componentId: ComponentId) => boolean
  list: () => ComponentRegistryItem[]
  resolve: (
    componentId: ComponentId,
  ) => { found: true; item: ComponentRegistryItem } | { found: false; componentId: ComponentId }
  migrateNode: (node: NodeDTO, context: ComponentMigrationContext) => ComponentMigrationResult
}

export declare function createComponentRegistry(): ComponentRegistry
```

### 最小示例形态

```ts
export const boxRegistryItem: ComponentRegistryItem = {
  componentId: asComponentId('Box'),
  displayName: 'Box',
  category: 'layout',
  defaultProps: {},
  allowedChildTypes: 'any',
  capabilities: {
    canHaveChildren: true,
    supportsStyleProps: true,
  },
}

export const textRegistryItem: ComponentRegistryItem = {
  componentId: asComponentId('Text'),
  displayName: 'Text',
  category: 'content',
  defaultProps: { text: '' },
  allowedChildTypes: 'none',
  capabilities: {
    canHaveChildren: false,
    isTextEditable: true,
  },
}
```

## 5. 测试与验证
- 单元测试：围绕 `createComponentRegistry()` 的 register/query/migrate 全路径测试。
- 集成验证：不需要接入 `App` 或 `EditorStore`；registry 应可在纯测试环境独立验证。
- 边界测试：重复注册、缺失组件 `require`、unknown `resolve`、未定义 `migrate` 的 no-op。
- 回归测试：导出面保持稳定，`src/core/index.ts` 可供后续 CE 直接导入。

## 6. 质量检查清单
- [ ] 功能完整性：仅覆盖 registry 类型、注册协议、查询 API
- [ ] 规范遵循：目录收敛到 `src/core/registry/**`
- [ ] 边界处理：重复注册、缺失查询、迁移 no-op 已定义
- [ ] 错误处理：错误消息包含 `componentId`
- [ ] 向后兼容：不破坏 CE-004 DTO 与 CE-006 store 边界
- [ ] 文档完整：runbook 含 tasks、路径建议、API 形态、示例
- [ ] 测试覆盖：公共 API 与异常路径均有测试
- [ ] 性能优化：纯内存 Map/Record 查询，避免过早复杂化

## 7. 总结与建议
- 实施总结：CE-009 应作为核心协议层落在 `src/core/registry/**`，通过纯类型 + 工厂 API 把组件注册与查询从编辑器/renderer 中剥离出来。
- 关键决策：不在 registry 中放 React renderer；unknown fallback 与 DOM renderer 都通过查询结果复用同一协议；示例仅保留 `Box` / `Text` shape。
- 后续建议：
  - CE-010 基于 `resolve()` 的 miss result 构建 `UnknownComponentDescriptor`
  - CE-011 在单独文件中批量注册 MVP 内置组件到 registry 实例
  - CE-013 使用 `require/resolve` 驱动递归渲染分派，但 renderer 映射仍放在 renderer 层
- 风险提示：若后续把实际渲染函数塞回 registry item，会把 core 与 React 渲染层重新耦合，需避免。

## 任务列表摘要
1. 建立 `src/core/registry/**` 目录与核心协议类型。
2. 实现可多实例化的 registry factory 与 register/query API。
3. 补上迁移钩子与 unknown fallback 所需查询结果类型。
4. 提供 `Box` / `Text` 最小示例定义与统一出口。
5. 以测试锁定协议、异常语义与导出面。

## 统一验收
- `npm run check`
