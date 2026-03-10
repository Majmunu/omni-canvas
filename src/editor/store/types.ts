import type { SavedDocument } from '../../core/dto/document'
import type { NodeId } from '../../core/types/id'

export interface DocumentSliceState {
  document: SavedDocument
}

export interface DocumentSliceActions {
  loadDocument: (document: SavedDocument) => void
  resetDocument: () => void
}

export interface RuntimeSliceState {
  // P0: runtime mirrors persistence; kept separate for future derivations/caches.
  runtimeDocument: SavedDocument
}

export interface RuntimeSliceActions {
  syncRuntimeFromDocument: () => void
}

export interface UISliceState {
  viewport: {
    zoom: number
    panX: number
    panY: number
  }

  panels: {
    leftOpen: boolean
    rightOpen: boolean
  }
}

export interface UISliceActions {
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  setPanelOpen: (panel: 'left' | 'right', open: boolean) => void
}

export interface SelectionSliceState {
  selectedNodeId: NodeId | null
  hoveredNodeId: NodeId | null
}

export interface SelectionSliceActions {
  setSelectedNodeId: (nodeId: NodeId | null) => void
  setHoveredNodeId: (nodeId: NodeId | null) => void
  clearSelection: () => void
}

export interface HistorySliceState {
  canUndo: boolean
  canRedo: boolean
}

export interface HistorySliceActions {
  markDocumentChanged: () => void
}

export type EditorStoreState = DocumentSliceState &
  DocumentSliceActions &
  RuntimeSliceState &
  RuntimeSliceActions &
  UISliceState &
  UISliceActions &
  SelectionSliceState &
  SelectionSliceActions &
  HistorySliceState &
  HistorySliceActions
