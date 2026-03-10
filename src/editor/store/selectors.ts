import type { EditorStoreState } from './types'

export const selectDocument = (state: EditorStoreState) => state.document
export const selectRootId = (state: EditorStoreState) => state.document.rootId
export const selectNodes = (state: EditorStoreState) => state.document.nodes
export const selectChildrenMap = (state: EditorStoreState) => state.document.childrenMap

export const selectSelectedNodeId = (state: EditorStoreState) => state.selectedNodeId
