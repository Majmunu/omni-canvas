import type { ComponentId } from '../types'
import type { ComponentRegistryItem } from './types'

export class DuplicateComponentRegistrationError extends Error {
  readonly componentId: ComponentId

  constructor(componentId: ComponentId) {
    super(`Component already registered: ${componentId}`)
    this.name = 'DuplicateComponentRegistrationError'
    this.componentId = componentId
  }
}

export class MissingComponentRegistrationError extends Error {
  readonly componentId: ComponentId

  constructor(componentId: ComponentId) {
    super(`Component not registered: ${componentId}`)
    this.name = 'MissingComponentRegistrationError'
    this.componentId = componentId
  }
}

export interface ComponentRegistry {
  register: (item: ComponentRegistryItem) => void
  registerMany: (items: ReadonlyArray<ComponentRegistryItem>) => void

  has: (componentId: ComponentId) => boolean
  get: (componentId: ComponentId) => ComponentRegistryItem | undefined
  require: (componentId: ComponentId) => ComponentRegistryItem

  list: () => ComponentRegistryItem[]
}

export const createComponentRegistry = (): ComponentRegistry => {
  const byId = new Map<ComponentId, ComponentRegistryItem>()

  const register = (item: ComponentRegistryItem): void => {
    if (byId.has(item.componentId)) {
      throw new DuplicateComponentRegistrationError(item.componentId)
    }

    byId.set(item.componentId, item)
  }

  const registerMany = (items: ReadonlyArray<ComponentRegistryItem>): void => {
    // Keep semantics predictable: if any item is a duplicate, throw and leave
    // already-registered items as-is (no rollback).
    for (const item of items) {
      register(item)
    }
  }

  const has = (componentId: ComponentId): boolean => byId.has(componentId)

  const get = (componentId: ComponentId): ComponentRegistryItem | undefined => byId.get(componentId)

  const require = (componentId: ComponentId): ComponentRegistryItem => {
    const item = byId.get(componentId)
    if (!item) {
      throw new MissingComponentRegistrationError(componentId)
    }
    return item
  }

  const list = (): ComponentRegistryItem[] => Array.from(byId.values())

  return {
    register,
    registerMany,
    has,
    get,
    require,
    list,
  }
}
