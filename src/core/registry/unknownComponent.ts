import type { ComponentId } from '../types'
import type { ComponentRegistryItem } from './types'

/**
 * CE-010 — UnknownComponent fallback descriptor.
 *
 * When a NodeDTO refers to an unregistered ComponentId, higher layers should
 * consume this descriptor to avoid crashes and keep data intact.
 */
export type UnknownComponentDescriptor = {
  kind: 'unknown'
  originalComponentId: ComponentId

  /** Optional label for diagnostics/UX. */
  displayName: string

  /** Conservative policy: unknown components are treated as leaf nodes. */
  registryItem: ComponentRegistryItem
}

export type KnownComponentDescriptor = {
  kind: 'known'
  registryItem: ComponentRegistryItem
}

export type ResolvedComponentDescriptor = KnownComponentDescriptor | UnknownComponentDescriptor

export const createUnknownComponentDescriptor = (
  originalComponentId: ComponentId
): UnknownComponentDescriptor => {
  const displayName = `Unknown: ${originalComponentId}`

  return {
    kind: 'unknown',
    originalComponentId,
    displayName,
    registryItem: {
      componentId: originalComponentId,
      displayName,
      category: 'unknown',
      children: { kind: 'none' },
      capabilities: [],
      defaultProps: {},
    },
  }
}
