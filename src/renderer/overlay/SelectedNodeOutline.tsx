import { useMemo } from 'react'

import { useEditorStore } from '../../editor/store'
import { selectSelectedNodeId } from '../../editor/store'

export function SelectedNodeOutline() {
  const selectedNodeId = useEditorStore(selectSelectedNodeId)

  const rect = useMemo(() => {
    if (!selectedNodeId) return null

    const el = document.querySelector(`[data-node-id="${selectedNodeId}"]`) as HTMLElement | null
    if (!el) return null

    const r = el.getBoundingClientRect()

    return {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    }
  }, [selectedNodeId])

  if (!selectedNodeId || !rect) return null

  return (
    <div
      aria-label="Selected node outline"
      style={{
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        border: '2px solid rgba(59, 130, 246, 0.9)',
        borderRadius: 6,
        boxSizing: 'border-box',
      }}
    />
  )
}
