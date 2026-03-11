import type { NodeDTO } from '../../../core/dto/node'

export function BoxView(props: { node: NodeDTO; children?: React.ReactNode }) {
  const { node, children } = props

  const width = typeof node.props.width === 'number' ? node.props.width : undefined
  const height = typeof node.props.height === 'number' ? node.props.height : undefined

  return (
    <div
      data-testid="node-box"
      data-node-id={node.id}
      style={{
        width,
        height,
        border: '1px solid #999',
        boxSizing: 'border-box',
        padding: 8,
      }}
    >
      {children}
    </div>
  )
}
