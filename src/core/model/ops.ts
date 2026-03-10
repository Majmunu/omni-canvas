import type { SavedDocument } from '../dto/document'
import type { ChildrenMap } from '../dto/childrenMap'
import type { NodeDTO } from '../dto/node'
import type { NodeId } from '../types/id'

export interface AddNodeArgs {
  parentId: NodeId
  node: NodeDTO
  index?: number
}

export function addNode(document: SavedDocument, args: AddNodeArgs): SavedDocument {
  const { parentId, node } = args

  if (!document.nodes[parentId]) {
    throw new Error(`addNode: parentId ${parentId} must exist in nodes`)
  }

  if (document.nodes[node.id]) {
    throw new Error(`addNode: node.id ${node.id} already exists in nodes`)
  }

  const parentChildren = document.childrenMap[parentId] ?? []
  const insertAt =
    args.index === undefined
      ? parentChildren.length
      : Math.min(Math.max(args.index, 0), parentChildren.length)

  const nextChildren = [
    ...parentChildren.slice(0, insertAt),
    node.id,
    ...parentChildren.slice(insertAt),
  ]

  const nextChildrenMap: ChildrenMap = {
    ...document.childrenMap,
    [parentId]: nextChildren,
  }

  // ensure every node can be a parent key with default empty list
  if (!nextChildrenMap[node.id]) {
    nextChildrenMap[node.id] = []
  }

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [node.id]: node,
    },
    childrenMap: nextChildrenMap,
  }
}

export interface RemoveNodeArgs {
  nodeId: NodeId
}

function collectSubtree(childrenMap: ChildrenMap, nodeId: NodeId): NodeId[] {
  const result: NodeId[] = []
  const stack: NodeId[] = [nodeId]

  while (stack.length > 0) {
    const current = stack.pop() as NodeId
    result.push(current)

    const children = childrenMap[current] ?? []
    for (const childId of children) {
      stack.push(childId)
    }
  }

  return result
}

function removeIdFromAllParents(childrenMap: ChildrenMap, nodeId: NodeId): ChildrenMap {
  const next: ChildrenMap = { ...childrenMap }

  for (const [parentId, children] of Object.entries(next) as Array<[NodeId, NodeId[]]>) {
    if (!children.includes(nodeId)) continue
    next[parentId] = children.filter((id) => id !== nodeId)
  }

  return next
}

/**
 * Removes a node and its entire subtree.
 *
 * P0: subtree delete keeps invariants simple and avoids orphaned nodes.
 */
export function removeNode(document: SavedDocument, args: RemoveNodeArgs): SavedDocument {
  const { nodeId } = args

  if (nodeId === document.rootId) {
    throw new Error('removeNode: cannot remove root node')
  }

  if (!document.nodes[nodeId]) {
    throw new Error(`removeNode: nodeId ${nodeId} must exist in nodes`)
  }

  const toDelete = new Set<NodeId>(collectSubtree(document.childrenMap, nodeId))

  const nextChildrenMap = removeIdFromAllParents(document.childrenMap, nodeId)

  // remove childrenMap entries for deleted nodes
  for (const id of toDelete) {
    delete nextChildrenMap[id]
  }

  const nextNodes = { ...document.nodes }
  for (const id of toDelete) {
    delete nextNodes[id]
  }

  // also remove any references to deleted nodes that might exist (best-effort)
  for (const [parentId, children] of Object.entries(nextChildrenMap) as Array<[NodeId, NodeId[]]>) {
    nextChildrenMap[parentId] = children.filter((id) => !toDelete.has(id))
  }

  return {
    ...document,
    nodes: nextNodes,
    childrenMap: nextChildrenMap,
  }
}

export interface MoveNodeArgs {
  nodeId: NodeId
  fromParentId: NodeId
  toParentId: NodeId
  toIndex: number
}

function containsInSubtree(childrenMap: ChildrenMap, root: NodeId, target: NodeId): boolean {
  const stack: NodeId[] = [root]

  while (stack.length > 0) {
    const current = stack.pop() as NodeId
    if (current === target) return true

    const children = childrenMap[current] ?? []
    for (const childId of children) {
      stack.push(childId)
    }
  }

  return false
}

export function moveNode(document: SavedDocument, args: MoveNodeArgs): SavedDocument {
  const { nodeId, fromParentId, toParentId, toIndex } = args

  if (nodeId === document.rootId) {
    throw new Error('moveNode: cannot move root node')
  }

  if (!document.nodes[nodeId]) {
    throw new Error(`moveNode: nodeId ${nodeId} must exist in nodes`)
  }

  if (!document.nodes[fromParentId]) {
    throw new Error(`moveNode: fromParentId ${fromParentId} must exist in nodes`)
  }

  if (!document.nodes[toParentId]) {
    throw new Error(`moveNode: toParentId ${toParentId} must exist in nodes`)
  }

  if (containsInSubtree(document.childrenMap, nodeId, toParentId)) {
    throw new Error('moveNode: cannot move node into its own subtree')
  }

  const fromChildren = document.childrenMap[fromParentId] ?? []
  if (!fromChildren.includes(nodeId)) {
    throw new Error(`moveNode: fromParentId ${fromParentId} does not contain nodeId ${nodeId}`)
  }

  const nextFromChildren = fromChildren.filter((id) => id !== nodeId)

  const toChildrenOriginal = document.childrenMap[toParentId] ?? []

  const baseToChildren = fromParentId === toParentId ? nextFromChildren : [...toChildrenOriginal]

  const insertAt = Math.min(Math.max(toIndex, 0), baseToChildren.length)
  const nextToChildren = [
    ...baseToChildren.slice(0, insertAt),
    nodeId,
    ...baseToChildren.slice(insertAt),
  ]

  return {
    ...document,
    childrenMap: {
      ...document.childrenMap,
      [fromParentId]: nextFromChildren,
      [toParentId]: nextToChildren,
    },
  }
}

export interface ReplacePropsArgs {
  nodeId: NodeId
  props: Record<string, unknown>
}

/**
 * Replaces a node's props entirely.
 *
 * P0: keep it simple and explicit; patch/merge can be added later.
 */
export function replaceProps(document: SavedDocument, args: ReplacePropsArgs): SavedDocument {
  const { nodeId, props } = args

  const existing = document.nodes[nodeId]
  if (!existing) {
    throw new Error(`replaceProps: nodeId ${nodeId} must exist in nodes`)
  }

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [nodeId]: {
        ...existing,
        props,
      },
    },
  }
}
