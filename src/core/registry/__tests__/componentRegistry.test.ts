import { describe, expect, it } from 'vitest'

import { asComponentId, asNodeId } from '../../types'
import {
  createComponentRegistry,
  DuplicateComponentRegistrationError,
  MissingComponentRegistrationError,
  migrateNodeViaRegistry,
  resolveComponent,
} from '../index'

import type { NodeDTO } from '../../dto'

describe('core/registry', () => {
  it('registers and queries items', () => {
    const registry = createComponentRegistry()

    const componentId = asComponentId('test/a')
    registry.register({
      componentId,
      displayName: 'A',
      children: { kind: 'none' },
    })

    expect(registry.has(componentId)).toBe(true)
    expect(registry.get(componentId)?.displayName).toBe('A')
    expect(registry.require(componentId).displayName).toBe('A')
    expect(registry.list()).toHaveLength(1)
  })

  it('throws on duplicate registrations', () => {
    const registry = createComponentRegistry()
    const componentId = asComponentId('test/dup')

    registry.register({
      componentId,
      displayName: 'Dup',
      children: { kind: 'none' },
    })

    expect(() =>
      registry.register({
        componentId,
        displayName: 'Dup 2',
        children: { kind: 'none' },
      })
    ).toThrow(DuplicateComponentRegistrationError)
  })

  it('throws on require() missing component', () => {
    const registry = createComponentRegistry()
    const componentId = asComponentId('test/miss')

    expect(() => registry.require(componentId)).toThrow(MissingComponentRegistrationError)
  })

  it('resolveComponent returns explicit miss result', () => {
    const registry = createComponentRegistry()
    const componentId = asComponentId('test/miss')

    expect(resolveComponent(registry, componentId)).toEqual({
      found: false,
      componentId,
    })
  })

  it('migrateNodeViaRegistry is transparent for ROOT and unknown components', () => {
    const registry = createComponentRegistry()

    const root: NodeDTO = {
      id: asNodeId('n_root'),
      type: 'ROOT',
      props: {},
    }

    const unknown: NodeDTO = {
      id: asNodeId('n_unknown'),
      type: asComponentId('test/unknown'),
      props: { a: 1 },
    }

    expect(migrateNodeViaRegistry(registry, root, {})).toEqual(root)
    expect(migrateNodeViaRegistry(registry, unknown, {})).toEqual(unknown)
  })

  it('migrateNodeViaRegistry applies migrate hook when registered', () => {
    const registry = createComponentRegistry()

    const componentId = asComponentId('test/migratable')
    registry.register({
      componentId,
      displayName: 'Migratable',
      children: { kind: 'none' },
      migrate: (props) => ({
        componentId,
        props: {
          ...props,
          migrated: true,
        },
      }),
    })

    const node: NodeDTO = {
      id: asNodeId('n1'),
      type: componentId,
      props: { a: 1 },
    }

    const migrated = migrateNodeViaRegistry(registry, node, {
      fromSchemaVersion: '0',
      toSchemaVersion: '1',
    })

    expect(migrated).toEqual({
      ...node,
      props: { a: 1, migrated: true },
    })
  })
})
