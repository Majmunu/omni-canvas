import type { NodeId } from '../types/id'

/**
 * childrenMap is the single source of truth for hierarchy.
 *
 * - Key: parent node id
 * - Value: ordered list of child node ids
 * - Order matters: later rendering uses this sequence (no zIndex in P0).
 */
export type ChildrenMap = Record<NodeId, NodeId[]>
