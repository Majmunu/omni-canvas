import { describe, expect, it } from 'vitest'

import { asComponentId, asNodeId } from '../../../core/types/id'
import type { NodeDTO } from '../../../core/dto/node'
import { createEmptyDocument } from '../../../core/model/document'
import { useEditorStore } from '../useEditorStore'

function resetStore() {
  useEditorStore.setState({
    // document/runtime
    document: createEmptyDocument(),
    runtimeDocument: createEmptyDocument(),

    // ui
    viewport: { zoom: 1, panX: 0, panY: 0 },
    panels: { leftOpen: true, rightOpen: true },

    // selection
    selectedNodeId: null,
    hoveredNodeId: null,

    // history placeholder
    canUndo: false,
    canRedo: false,
  } as never)
}

describe('useEditorStore (CE-006)', () => {
  it('starts with an empty document with ROOT node', () => {
    resetStore()

    const { document } = useEditorStore.getState()

    expect(document.rootId).toBeTruthy()
    expect(document.nodes[document.rootId]?.type).toBe('ROOT')
    expect(document.childrenMap[document.rootId]).toEqual([])
  })

  it('addNode and replaceProps update document and runtimeDocument', () => {
    resetStore()

    const store = useEditorStore.getState()
    const rootId = store.document.rootId

    const node: NodeDTO = {
      id: asNodeId('n1'),
      type: asComponentId('Box'),
      props: { a: 1 },
    }

    store.addNode({ parentId: rootId, node })

    const afterAdd = useEditorStore.getState()
    expect(afterAdd.document.nodes[node.id]).toBeTruthy()
    expect(afterAdd.runtimeDocument.nodes[node.id]).toBeTruthy()

    store.replaceProps({ nodeId: node.id, props: { b: 2 } })

    const afterProps = useEditorStore.getState()
    expect(afterProps.document.nodes[node.id]?.props).toEqual({ b: 2 })
    expect(afterProps.runtimeDocument.nodes[node.id]?.props).toEqual({ b: 2 })
  })
})
