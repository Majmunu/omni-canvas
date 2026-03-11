import { createBuiltinComponentRegistry } from '../../core/registry'
import { newNodeId } from '../../core/types/newId'

import { useEditorStore } from '../store'
import { selectDocument, selectSelectedNodeId } from '../store'

export function PalettePanel() {
  const items = createBuiltinComponentRegistry().list()
  const document = useEditorStore(selectDocument)
  const selectedNodeId = useEditorStore(selectSelectedNodeId)
  const addNode = useEditorStore((state) => state.addNode)
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId)

  return (
    <section aria-label="Palette" className="editor-panel editor-panel--palette">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Palette</h3>
      </header>

      <div className="editor-panel__body">
        <ul aria-label="Palette components">
          {items.map((item) => (
            <li key={item.componentId}>
              <button
                type="button"
                onClick={() => {
                  const parentId = selectedNodeId ?? document.rootId

                  const nodeId = newNodeId(item.displayName.toLowerCase())
                  addNode({
                    parentId,
                    node: {
                      id: nodeId,
                      type: item.componentId,
                      props: item.defaultProps ?? {},
                    },
                  })
                  setSelectedNodeId(nodeId)
                }}
              >
                {item.displayName}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
