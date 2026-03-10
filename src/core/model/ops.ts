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

  const nextChildren = parentChildren.toSpliced(insertAt, 0, node.id)

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

  let nextChildrenMap = removeIdFromAllParents(document.childrenMap, nodeId)

  // remove childrenMap entries for deleted nodes
  for (const id of toDelete) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete nextChildrenMap[id]
  }

  const nextNodes = { ...document.nodes }
  for (const id of toDelete) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
