import type React from 'react'

export function LayersPanel(props: { children?: React.ReactNode }) {
  return (
    <section aria-label="Layers" className="editor-panel editor-panel--layers">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Layers</h3>
      </header>
      <div className="editor-panel__body">{props.children ?? <p>Layers coming soon.</p>}</div>
    </section>
  )
}
