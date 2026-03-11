import type { SavedDocument } from '../../core/dto/document'
import type { ComponentRegistry } from '../../core/registry/createComponentRegistry'

import { NodeRenderer } from './NodeRenderer'

export function CanvasRoot(props: { document: SavedDocument; registry: ComponentRegistry }) {
  const { document, registry } = props

  return (
    <div data-testid="dom-canvas-root">
      <NodeRenderer nodeId={document.rootId} document={document} registry={registry} />
    </div>
  )
}
