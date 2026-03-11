import type { SavedDocument } from '../../core/dto/document'
import type { NodeId } from '../../core/types/id'
import type { ComponentRegistry } from '../../core/registry/createComponentRegistry'

import { boxComponentId, textComponentId } from '../../core/registry/builtinSamples'

import { BoxView } from './views/BoxView'
import { TextView } from './views/TextView'

export function NodeRenderer(props: {
  nodeId: NodeId
  document: SavedDocument
  registry: ComponentRegistry
}) {
  const { nodeId, document, registry } = props

  const node = document.nodes[nodeId]
  if (!node) {
    return <div data-testid="node-missing">Missing node: {nodeId}</div>
  }

  const childIds = document.childrenMap[nodeId] ?? []

  if (node.type === 'ROOT') {
    return (
      <div data-testid="node-root" data-node-id={node.id}>
        {childIds.map((childId) => (
          <NodeRenderer key={childId} nodeId={childId} document={document} registry={registry} />
        ))}
      </div>
    )
  }

  if (node.type === boxComponentId) {
    return (
      <BoxView node={node}>
        {childIds.map((childId) => (
          <NodeRenderer key={childId} nodeId={childId} document={document} registry={registry} />
        ))}
      </BoxView>
    )
  }

  if (node.type === textComponentId) {
    return <TextView node={node} />
  }

  // For CE-013 we keep unknown behavior DOM-only; CE-010 provides descriptor
  // types for higher-level consumers.
  void registry

  return (
    <div data-testid="node-unknown" data-node-id={node.id}>
      Unknown: {node.type}
    </div>
  )
}
