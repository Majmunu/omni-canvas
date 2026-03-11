import type { NodeDTO } from '../../../core/dto/node'

export function BoxView(props: { node: NodeDTO; children?: React.ReactNode }) {
  const { node, children } = props

  const width = typeof node.props.width === 'number' ? node.props.width : undefined
  const height = typeof node.props.height === 'number' ? node.props.height : undefined

  const x = typeof node.props.x === 'number' ? node.props.x : undefined
  const y = typeof node.props.y === 'number' ? node.props.y : undefined

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
        background: '#ffffff',
        position: x !== undefined || y !== undefined ? 'absolute' : undefined,
        left: x,
        top: y,
      }}
    >
      {children}
    </div>
  )
}
