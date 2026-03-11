import { builtinSampleRegistryItems } from './builtinSamples'
import { createComponentRegistry, type ComponentRegistry } from './createComponentRegistry'

export const createBuiltinComponentRegistry = (): ComponentRegistry => {
  const registry = createComponentRegistry()
  registry.registerMany(builtinSampleRegistryItems)
  return registry
}
