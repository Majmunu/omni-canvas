import { useMemo } from 'react'

import { useEditorStore } from '../store'
import { selectDocument } from '../store'

import { buildLayerTree, type LayerTreeNode } from '../layers/buildLayerTree'

function LayerTreeView(props: { node: LayerTreeNode }) {
  const { node } = props

  return (
    <li>
      <button type="button">{node.node.type}</button>
      {node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <LayerTreeView key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function LayersPanel() {
  const document = useEditorStore(selectDocument)

  const tree = useMemo(() => buildLayerTree({ document }), [document])

  return (
    <section aria-label="Layers" className="editor-panel editor-panel--layers">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Layers</h3>
      </header>

      <div className="editor-panel__body">
        <ul aria-label="Layers tree">
          <LayerTreeView node={tree} />
        </ul>
      </div>
    </section>
  )
}
