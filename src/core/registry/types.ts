import type { ComponentId } from '../types'

/**
 * CE-009 — Registry contracts
 *
 * Registry 是引擎 core 的协议层：负责“组件定义的注册与查询”，而不是 renderer/UI。
 *
 * 约束：
 * - 不包含 React 组件、render function、DOM 细节
 * - 不承担 UnknownComponent 的 UI 呈现（那是 CE-010/CE-013 的职责）
 * - 不注册 ROOT（ROOT 是文档结构约定，不是业务组件）
 */

export type ComponentCapability = 'children' | 'text' | 'style' | 'layout' | 'events' | 'draggable'

export type ChildrenPolicy =
  | { kind: 'none' }
  | { kind: 'any' }
  | { kind: 'whitelist'; componentIds: ComponentId[] }

export type ComponentDefaultProps = Record<string, unknown>

export interface ComponentRegistryItem {
  componentId: ComponentId

  /** Human-friendly label (no i18n layer here). */
  displayName: string

  /** Optional classification for palettes/tooling. */
  category?: string

  /** Minimal, serializable defaults; used when creating new nodes. */
  defaultProps?: ComponentDefaultProps

  /** Children rule; default is none. */
  children?: ChildrenPolicy

  /** Capability flags for editor tooling & future renderer decisions. */
  capabilities?: ReadonlyArray<ComponentCapability>

  /** Optional migration hook for persisted nodes/props evolution. */
  migrate?: ComponentMigrationHook
}

export interface ComponentMigrationContext {
  /** Version tag of the saved document schema, if present. */
  fromSchemaVersion?: string

  /** Target schema version the runtime expects, if applicable. */
  toSchemaVersion?: string
}

export type ComponentMigrationResult<TProps = Record<string, unknown>> = {
  componentId: ComponentId
  props: TProps
}

export type ComponentMigrationHook = (
  props: Record<string, unknown>,
  context: ComponentMigrationContext
) => ComponentMigrationResult

export type RegistryResolveResult =
  | { found: true; item: ComponentRegistryItem }
  | { found: false; componentId: ComponentId }
