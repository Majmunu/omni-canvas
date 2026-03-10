import { useEditorStore } from './editor/store'
import { selectRootId } from './editor/store'

function EditorShell(props: { debugRootId?: string }) {
  const { debugRootId } = props

  return (
    <main
      className="editor-shell"
      data-testid="editor-shell"
      aria-labelledby="editor-workspace-title"
    >
      <p aria-label="Editor Debug RootId" data-testid="editor-debug-rootid">
        RootId: {debugRootId ?? '(none)'}
      </p>

      <header
        className="editor-shell__topbar"
        data-testid="editor-topbar"
        data-scroll-region="true"
        aria-label="Editor top bar"
      >
        <div>
          <p className="editor-shell__eyebrow">Canvas Editor</p>
          <h1 id="editor-workspace-title">Editor Workspace</h1>
        </div>
        <p className="editor-shell__copy">
          Top bar placeholder for project context and global actions.
        </p>
      </header>

      <div className="editor-shell__body" role="presentation">
        <aside
          className="editor-shell__panel editor-shell__panel--left"
          data-testid="editor-left-panel"
          data-scroll-region="true"
          aria-labelledby="editor-left-panel-title"
        >
          <h2 id="editor-left-panel-title">Left Panel</h2>
          <p>Palette and navigation placeholders will attach here in a later task.</p>
        </aside>

        <section
          className="editor-shell__canvas"
          data-testid="editor-canvas"
          data-scroll-region="true"
          aria-labelledby="editor-canvas-title"
        >
          <h2 id="editor-canvas-title">Canvas Area</h2>
          <p>Renderer is not connected yet. Use this area as the empty canvas stage.</p>
        </section>

        <aside
          className="editor-shell__panel editor-shell__panel--right"
          data-testid="editor-right-panel"
          data-scroll-region="true"
          aria-labelledby="editor-right-panel-title"
        >
          <h2 id="editor-right-panel-title">Right Panel</h2>
          <p>
            Inspector and detail placeholders will land here after the shell baseline is stable.
          </p>
        </aside>
      </div>

      <footer
        className="editor-shell__statusbar"
        data-testid="editor-statusbar"
        data-scroll-region="true"
        aria-label="Editor status bar"
      >
        <strong>Status Bar</strong>
        <span>Shell ready. No canvas document is loaded yet.</span>
      </footer>
    </main>
  )
}

function App() {
  const rootId = useEditorStore(selectRootId)

  return <EditorShell debugRootId={rootId} />
}

export default App
