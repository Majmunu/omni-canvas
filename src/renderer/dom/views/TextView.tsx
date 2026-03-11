import type { NodeDTO } from '../../../core/dto/node'

export function TextView(props: { node: NodeDTO }) {
  const { node } = props

  const text = typeof node.props.text === 'string' ? node.props.text : ''

  return (
    <span data-testid="node-text" data-node-id={node.id}>
      {text}
    </span>
  )
}
