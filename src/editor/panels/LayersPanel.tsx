import { useMemo } from 'react'

import type { NodeId } from '../../core/types/id'

import { useEditorStore } from '../store'
import { selectDocument, selectSelectedNodeId } from '../store'

import { buildLayerTree, type LayerTreeNode } from '../layers/buildLayerTree'

type LayerTreeViewProps = {
  node: LayerTreeNode
  selectedNodeId: NodeId | null
  onSelect: (nodeId: NodeId) => void
}

function LayerTreeView(props: LayerTreeViewProps) {
  const { node, selectedNodeId, onSelect } = props
  const selected = selectedNodeId === node.id

  return (
    <li>
      <button
        type="button"
        aria-current={selected ? 'true' : undefined}
        onClick={() => onSelect(node.id)}
      >
        {node.node.type}
      </button>
      {node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <LayerTreeView
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function LayersPanel() {
  const document = useEditorStore(selectDocument)
  const selectedNodeId = useEditorStore(selectSelectedNodeId)
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId)

  const tree = useMemo(() => buildLayerTree({ document }), [document])

  return (
    <section aria-label="Layers" className="editor-panel editor-panel--layers">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Layers</h3>
      </header>

      <div className="editor-panel__body">
        <ul aria-label="Layers tree">
          <LayerTreeView
            node={tree}
            selectedNodeId={selectedNodeId}
            onSelect={(nodeId) => setSelectedNodeId(nodeId)}
          />
        </ul>
      </div>
    </section>
  )
}
