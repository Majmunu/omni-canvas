import type { ChildrenMap } from './childrenMap'
import type { NodeDTO } from './node'
import type { NodeId } from '../types/id'

/**
 * Saved document data.
 *
 * P0 constraints:
 * - Do NOT store viewport/platform/device/selection.
 * - History is handled separately (CE-008).
 */
export interface SavedDocument {
  /** schema version for migrations */
  version: string
  rootId: NodeId
  nodes: Record<NodeId, NodeDTO>
  childrenMap: ChildrenMap
}

/**
 * Runtime schema used by the editor.
 *
 * P0: currently mirrors SavedDocument, but we keep a separate type to allow
 * evolution without breaking persistence.
 */
export interface RuntimeSchema {
  document: SavedDocument
}
