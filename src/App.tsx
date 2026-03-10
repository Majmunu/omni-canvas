function EditorShell() {
  return (
    <main className="editor-shell" data-testid="editor-shell" aria-label="Editor shell">
      <header className="editor-topbar" data-testid="editor-topbar" aria-label="Editor top bar">
        <div>
          <p className="editor-eyebrow">Canvas Editor</p>
          <h1>Editor Workspace</h1>
        </div>
        <p className="editor-copy">Top bar placeholder for project context and global actions.</p>
      </header>

      <div className="editor-body">
        <aside
          className="editor-panel"
          data-testid="editor-left-panel"
          aria-label="Editor left panel"
        >
          <h2>Left Panel</h2>
          <p>Palette and navigation placeholders will attach here in a later task.</p>
        </aside>

        <section
          className="editor-canvas-area"
          data-testid="editor-canvas-area"
          aria-label="Editor canvas area"
        >
          <h2>Canvas Area</h2>
          <p>Renderer is not connected yet. Use this area as the empty canvas stage.</p>
        </section>

        <aside
          className="editor-panel"
          data-testid="editor-right-panel"
          aria-label="Editor right panel"
        >
          <h2>Right Panel</h2>
          <p>
            Inspector and detail placeholders will land here after the shell baseline is stable.
          </p>
        </aside>
      </div>

      <footer
        className="editor-status-bar"
        data-testid="editor-status-bar"
        aria-label="Editor status bar"
      >
        <strong>Status Bar</strong>
        <span>Shell ready. No canvas document is loaded yet.</span>
      </footer>
    </main>
  )
}

function App() {
  return <EditorShell />
}

export default App
