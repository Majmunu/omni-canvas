import { useEditorStore } from '../store'
import { selectDocument, selectSelectedNodeId } from '../store'

export function InspectorPanel() {
  const document = useEditorStore(selectDocument)
  const selectedNodeId = useEditorStore(selectSelectedNodeId)

  const selectedNode = selectedNodeId ? document.nodes[selectedNodeId] : null

  return (
    <section aria-label="Inspector" className="editor-panel editor-panel--inspector">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Inspector</h3>
      </header>

      <div className="editor-panel__body">
        {selectedNodeId === null ? (
          <p>Select a node to inspect its properties.</p>
        ) : selectedNode ? (
          <div>
            <p>
              <strong>Selected:</strong> {selectedNodeId}
            </p>
            <p>
              <strong>Type:</strong> {selectedNode.type}
            </p>
            <pre aria-label="Selected node props">
              {JSON.stringify(selectedNode.props, null, 2)}
            </pre>
          </div>
        ) : (
          <p>Selected node not found.</p>
        )}
      </div>
    </section>
  )
}
