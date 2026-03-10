import { create } from 'zustand'

import { createEmptyDocument } from '../../core/model/document'
import type { EditorStoreState } from './types'

export const useEditorStore = create<EditorStoreState>((set, get) => {
  const initialDocument = createEmptyDocument()

  return {
    // Document layer
    document: initialDocument,
    loadDocument: (document) =>
      set(() => ({
        document,
      })),
    resetDocument: () =>
      set(() => ({
        document: createEmptyDocument(),
      })),

    // Runtime layer (P0 mirror)
    runtimeDocument: initialDocument,
    syncRuntimeFromDocument: () =>
      set(() => ({
        runtimeDocument: get().document,
      })),

    // UI / viewport layer
    viewport: {
      zoom: 1,
      panX: 0,
      panY: 0,
    },
    panels: {
      leftOpen: true,
      rightOpen: true,
    },
    setZoom: (zoom) =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom,
        },
      })),
    setPan: (pan) =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          panX: pan.x,
          panY: pan.y,
        },
      })),
    setPanelOpen: (panel, open) =>
      set((state) => ({
        panels: {
          ...state.panels,
          leftOpen: panel === 'left' ? open : state.panels.leftOpen,
          rightOpen: panel === 'right' ? open : state.panels.rightOpen,
        },
      })),

    // Selection layer
    selectedNodeId: null,
    hoveredNodeId: null,
    setSelectedNodeId: (nodeId) => set(() => ({ selectedNodeId: nodeId })),
    setHoveredNodeId: (nodeId) => set(() => ({ hoveredNodeId: nodeId })),
    clearSelection: () => set(() => ({ selectedNodeId: null, hoveredNodeId: null })),

    // History placeholder layer
    canUndo: false,
    canRedo: false,
    markDocumentChanged: () => {
      // placeholder; CE-008 will implement history stack.
      void 0
    },
  }
})
