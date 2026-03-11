import { createBuiltinComponentRegistry } from '../../core/registry'

export function PalettePanel() {
  const items = createBuiltinComponentRegistry().list()

  return (
    <section aria-label="Palette" className="editor-panel editor-panel--palette">
      <header className="editor-panel__header">
        <h3 className="editor-panel__title">Palette</h3>
      </header>

      <div className="editor-panel__body">
        <ul aria-label="Palette components">
          {items.map((item) => (
            <li key={item.componentId}>
              <button type="button">{item.displayName}</button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
