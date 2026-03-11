import type { NodeDTO } from '../dto'
import type { ComponentId } from '../types'
import type { ComponentRegistry } from './createComponentRegistry'
import { resolveComponent } from './registryHelpers'
import type { ResolvedComponentDescriptor } from './unknownComponent'
import { createUnknownComponentDescriptor, type KnownComponentDescriptor } from './unknownComponent'

export const resolveNodeComponentDescriptor = (
  registry: ComponentRegistry,
  node: NodeDTO
): ResolvedComponentDescriptor => {
  if (node.type === 'ROOT') {
    // ROOT is a document structural convention; not a registry component.
    // Callers should handle ROOT separately; we return unknown descriptor here
    // only as a safe default.
    return createUnknownComponentDescriptor(node.type as unknown as ComponentId)
  }

  const resolved = resolveComponent(registry, node.type)
  if (!resolved.found) {
    return createUnknownComponentDescriptor(resolved.componentId)
  }

  const known: KnownComponentDescriptor = {
    kind: 'known',
    registryItem: resolved.item,
  }

  return known
}
