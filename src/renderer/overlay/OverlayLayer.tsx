import { useEditorStore } from '../../editor/store'
import { selectSelectedNodeId } from '../../editor/store'

import { SelectedNodeOutline } from './SelectedNodeOutline'

export function OverlayLayer(props: { children?: React.ReactNode }) {
  const { children } = props
  const selectedNodeId = useEditorStore(selectSelectedNodeId)

  return (
    <div
      data-testid="overlay-layer"
      aria-label="Overlay layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {selectedNodeId ? (
        <div
          aria-label="Selection hint"
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
            padding: '6px 10px',
            borderRadius: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            color: 'white',
            fontSize: 12,
          }}
        >
          Selected: {selectedNodeId}
        </div>
      ) : null}

      {/* P0 outline (viewport-independent, fixed positioning) */}
      <SelectedNodeOutline />

      {children}
    </div>
  )
}
