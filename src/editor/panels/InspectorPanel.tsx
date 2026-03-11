import type React from 'react'

export function InspectorPanel(props: { children?: React.ReactNode }) {
  return (
    <section aria-label="Inspector" className="editor-panel editor-panel--inspector">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Inspector</h3>
      </header>
      <div className="editor-panel__body">
        {props.children ?? <p>Select a node to inspect its properties.</p>}
      </div>
    </section>
  )
}
