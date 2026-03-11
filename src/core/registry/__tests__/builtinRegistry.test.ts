import { describe, expect, it } from 'vitest'

import { boxComponentId, createBuiltinComponentRegistry, textComponentId } from '../index'

describe('core/registry builtin registry', () => {
  it('creates a registry pre-populated with builtin sample items', () => {
    const registry = createBuiltinComponentRegistry()

    expect(registry.has(boxComponentId)).toBe(true)
    expect(registry.has(textComponentId)).toBe(true)
  })
})
