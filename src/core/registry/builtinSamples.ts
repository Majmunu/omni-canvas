import { asComponentId } from '../types'
import type { ComponentRegistryItem } from './types'

export const boxComponentId = asComponentId('core/box')
export const textComponentId = asComponentId('core/text')

export const boxRegistryItem: ComponentRegistryItem = {
  componentId: boxComponentId,
  displayName: 'Box',
  category: 'layout',
  children: { kind: 'any' },
  capabilities: ['children', 'layout', 'style'],
  defaultProps: {
    width: 100,
    height: 100,
  },
}

export const textRegistryItem: ComponentRegistryItem = {
  componentId: textComponentId,
  displayName: 'Text',
  category: 'content',
  children: { kind: 'none' },
  capabilities: ['text', 'style'],
  defaultProps: {
    text: 'Hello',
  },
}

export const builtinSampleRegistryItems: ReadonlyArray<ComponentRegistryItem> = [
  boxRegistryItem,
  textRegistryItem,
]
