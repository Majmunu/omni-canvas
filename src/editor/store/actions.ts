import { addNode, moveNode, removeNode, replaceProps } from '../../core/model/ops'
import type { NodeDTO } from '../../core/dto/node'
import type { NodeId } from '../../core/types/id'
import type { EditorStoreState } from './types'

export interface AddNodeActionArgs {
  parentId: NodeId
  node: NodeDTO
  index?: number
}

export interface MoveNodeActionArgs {
  nodeId: NodeId
  fromParentId: NodeId
  toParentId: NodeId
  toIndex: number
}

export interface RemoveNodeActionArgs {
  nodeId: NodeId
}

export interface ReplacePropsActionArgs {
  nodeId: NodeId
  props: Record<string, unknown>
}

export function createOperationActions(params: {
  set: (fn: (state: EditorStoreState) => Partial<EditorStoreState>) => void
  get: () => EditorStoreState
}): Pick<EditorStoreState, 'addNode' | 'moveNode' | 'removeNode' | 'replaceProps'> {
  const { set, get } = params

  return {
    addNode: (args) => {
      set((state) => {
        const nextDocument = addNode(state.document, args)

        return {
          document: nextDocument,
          runtimeDocument: nextDocument,
        }
      })

      get().markDocumentChanged()
    },

    moveNode: (args) => {
      set((state) => {
        const nextDocument = moveNode(state.document, args)

        return {
          document: nextDocument,
          runtimeDocument: nextDocument,
        }
      })

      get().markDocumentChanged()
    },

    removeNode: (args) => {
      set((state) => {
        const nextDocument = removeNode(state.document, args)

        return {
          document: nextDocument,
          runtimeDocument: nextDocument,
        }
      })

      get().markDocumentChanged()
    },

    replaceProps: (args) => {
      set((state) => {
        const nextDocument = replaceProps(state.document, args)

        return {
          document: nextDocument,
          runtimeDocument: nextDocument,
        }
      })

      get().markDocumentChanged()
    },
  }
}
