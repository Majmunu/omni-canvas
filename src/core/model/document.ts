import type { SavedDocument } from '../dto/document'
import type { NodeDTO } from '../dto/node'
import { asNodeId } from '../types/id'

const DEFAULT_VERSION = '0.1.0'

export function createEmptyDocument(): SavedDocument {
  const rootId = asNodeId('root')

  const rootNode: NodeDTO = {
    id: rootId,
    type: 'ROOT',
    props: {},
  }

  return {
    version: DEFAULT_VERSION,
    rootId,
    nodes: {
      [rootId]: rootNode,
    },
    childrenMap: {
      [rootId]: [],
    },
  }
}
