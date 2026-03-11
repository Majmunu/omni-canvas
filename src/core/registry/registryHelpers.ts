import type { NodeDTO } from '../dto'
import type { ComponentId } from '../types'
import type { ComponentRegistry } from './createComponentRegistry'
import type {
  ComponentMigrationContext,
  ComponentMigrationResult,
  RegistryResolveResult,
} from './types'

/**
 * Resolve a component id to a registry item, but keep the miss path explicit.
 *
 * This is intended to be the stable boundary CE-010 (UnknownComponent) can use
 * without guessing whether `get()` returned undefined due to a bug.
 */
export const resolveComponent = (
  registry: ComponentRegistry,
  componentId: ComponentId
): RegistryResolveResult => {
  const item = registry.get(componentId)
  if (!item) {
    return { found: false, componentId }
  }

  return { found: true, item }
}

/**
 * Apply registry migration hook to a node if the component is registered.
 *
 * Contract:
 * - If component not registered => transparent no-op.
 * - If registered but no migrate hook => transparent no-op.
 * - If migrate returns, we only replace props; node id/type remain unchanged.
 */
export const migrateNodeViaRegistry = (
  registry: ComponentRegistry,
  node: NodeDTO,
  context: ComponentMigrationContext
): NodeDTO => {
  if (node.type === 'ROOT') {
    return node
  }

  const resolve = resolveComponent(registry, node.type)
  if (!resolve.found) {
    return node
  }

  if (!resolve.item.migrate) {
    return node
  }

  const result: ComponentMigrationResult = resolve.item.migrate(node.props, context)

  return {
    ...node,
    props: result.props,
  }
}
