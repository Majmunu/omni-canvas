# CE-011 Runbook — 注册 MVP 内置组件

> 目标：提供一个“内置组件注册入口”，把 MVP 组件（至少 Box/Text）按统一协议注册到 registry，供后续 Palette/Renderer/Inspector 消费。

## 核心约束
- 不引入 renderer（renderer 在 CE-013）。
- 不耦合 React 组件实现（registry 只登记元信息与默认 props）。
- 只做 MVP：优先复用 CE-009 的 `builtinSampleRegistryItems`，并提供一个创建“带内置组件的 registry”的便捷工厂。

## Task 1 — 创建 builtin registry 工厂
- 新增 `createBuiltinComponentRegistry()`：
  - 内部 `createComponentRegistry()`
  - `registerMany(builtinSampleRegistryItems)`
  - 返回 registry 实例

**验收**
- `npm run check` 通过

**Commit**
- `feat(ce-011): create builtin component registry`

## Task 2 — 测试
- 覆盖：`createBuiltinComponentRegistry()` 创建后，`has(box/text)` 为 true。

**Commit**
- `test(ce-011): cover builtin component registry`
