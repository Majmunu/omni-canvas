import type { SavedDocument } from '../../core/dto/document'
import type { NodeDTO } from '../../core/dto/node'
import type { NodeId } from '../../core/types/id'

export type LayerTreeNode = {
  id: NodeId
  node: NodeDTO
  children: LayerTreeNode[]
}

const MAX_LAYER_TREE_DEPTH = 100

export function buildLayerTree(args: { document: SavedDocument; rootId?: NodeId }): LayerTreeNode {
  const { document } = args
  const rootId = args.rootId ?? document.rootId

  const rootNode = document.nodes[rootId]
  if (!rootNode) {
    throw new Error(`Missing root node: ${rootId}`)
  }

  const visit = (nodeId: NodeId, depth: number): LayerTreeNode => {
    if (depth > MAX_LAYER_TREE_DEPTH) {
      throw new Error(`Layer tree depth exceeded (${MAX_LAYER_TREE_DEPTH}) at ${nodeId}`)
    }

    const node = document.nodes[nodeId]
    if (!node) {
      throw new Error(`Missing node: ${nodeId}`)
    }

    const childIds = document.childrenMap[nodeId] ?? []

    return {
      id: nodeId,
      node,
      children: childIds.map((childId) => visit(childId, depth + 1)),
    }
  }

  return visit(rootId, 0)
}
