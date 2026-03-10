export type Brand<K, T> = K & { readonly __brand: T }

export type NodeId = Brand<string, 'NodeId'>
export type ComponentId = Brand<string, 'ComponentId'>

export const asNodeId = (value: string): NodeId => value as NodeId
export const asComponentId = (value: string): ComponentId => value as ComponentId
