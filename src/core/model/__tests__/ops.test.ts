import { describe, expect, it } from 'vitest'

import type { NodeDTO } from '../../dto/node'
import { asComponentId, asNodeId } from '../../types/id'
import { createEmptyDocument } from '../document'
import { addNode, removeNode } from '../ops'

describe('core/model/ops', () => {
  it('addNode appends to parent children by default and creates empty children list for new node', () => {
    const doc = createEmptyDocument()
    const rootId = doc.rootId

    const child: NodeDTO = {
      id: asNodeId('n1'),
      type: asComponentId('Box'),
      props: { a: 1 },
    }

    const next = addNode(doc, { parentId: rootId, node: child })

    expect(next.nodes[child.id]).toEqual(child)
    expect(next.childrenMap[rootId]).toEqual([child.id])
    expect(next.childrenMap[child.id]).toEqual([])
  })

  it('addNode inserts at the given index', () => {
    const doc = createEmptyDocument()
    const rootId = doc.rootId

    const a: NodeDTO = { id: asNodeId('a'), type: asComponentId('Box'), props: {} }
    const b: NodeDTO = { id: asNodeId('b'), type: asComponentId('Box'), props: {} }

    const withA = addNode(doc, { parentId: rootId, node: a })
    const withAB = addNode(withA, { parentId: rootId, node: b, index: 0 })

    expect(withAB.childrenMap[rootId]).toEqual([b.id, a.id])
  })

  it('removeNode deletes subtree and removes references from parents', () => {
    const doc = createEmptyDocument()
    const rootId = doc.rootId

    const parent: NodeDTO = { id: asNodeId('p'), type: asComponentId('Box'), props: {} }
    const child: NodeDTO = { id: asNodeId('c'), type: asComponentId('Box'), props: {} }

    const withP = addNode(doc, { parentId: rootId, node: parent })
    const withPC = addNode(withP, { parentId: parent.id, node: child })

    const next = removeNode(withPC, { nodeId: parent.id })

    expect(next.nodes[parent.id]).toBeUndefined()
    expect(next.nodes[child.id]).toBeUndefined()
    expect(next.childrenMap[rootId]).toEqual([])
    expect(next.childrenMap[parent.id]).toBeUndefined()
  })
})
