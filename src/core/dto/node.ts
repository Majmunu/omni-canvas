import type { ComponentId, NodeId } from '../types/id'

/**
 * P0 Node type for the editor canvas.
 *
 * - `ROOT` is a reserved virtual component used as the document root.
 * - Other values map to registered component ids (see CE-009+).
 */
export type NodeType = 'ROOT' | ComponentId

/**
 * P0 props are intentionally loose. Constraints:
 * - should be JSON-serializable values
 * - runtime validation is out of scope for CE-004
 */
export type NodeProps = Record<string, unknown>

export interface NodeDTO {
  id: NodeId
  type: NodeType
  props: NodeProps
}
