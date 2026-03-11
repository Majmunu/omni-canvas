import { describe, expect, it } from 'vitest'

import { asComponentId, asNodeId } from '../../types'
import type { NodeDTO } from '../../dto'
import {
  builtinSampleRegistryItems,
  createComponentRegistry,
  resolveNodeComponentDescriptor,
} from '../index'

describe('core/registry unknown fallback', () => {
  it('returns unknown descriptor when component is not registered', () => {
    const registry = createComponentRegistry()

    const node: NodeDTO = {
      id: asNodeId('n1'),
      type: asComponentId('not/registered'),
      props: { a: 1 },
    }

    const desc = resolveNodeComponentDescriptor(registry, node)

    expect(desc.kind).toBe('unknown')
    if (desc.kind === 'unknown') {
      expect(desc.originalComponentId).toBe(node.type)
      expect(desc.registryItem.children).toEqual({ kind: 'none' })
    }
  })

  it('returns known descriptor when component is registered', () => {
    const registry = createComponentRegistry()
    registry.registerMany(builtinSampleRegistryItems)

    const node: NodeDTO = {
      id: asNodeId('n1'),
      type: builtinSampleRegistryItems[0].componentId,
      props: {},
    }

    const desc = resolveNodeComponentDescriptor(registry, node)

    expect(desc.kind).toBe('known')
    if (desc.kind === 'known') {
      expect(desc.registryItem.componentId).toBe(node.type)
    }
  })
})
