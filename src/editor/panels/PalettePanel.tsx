import type React from 'react'

export function PalettePanel(props: { children?: React.ReactNode }) {
  return (
    <section aria-label="Palette" className="editor-panel editor-panel--palette">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Palette</h3>
      </header>
      <div className="editor-panel__body">{props.children ?? <p>Palette coming soon.</p>}</div>
    </section>
  )
}
