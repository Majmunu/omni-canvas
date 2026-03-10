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

it('moveNode reorders within the same parent', () => {
  const doc = createEmptyDocument()
  const rootId = doc.rootId

  const a: NodeDTO = { id: asNodeId('a'), type: asComponentId('Box'), props: {} }
  const b: NodeDTO = { id: asNodeId('b'), type: asComponentId('Box'), props: {} }

  const withA = addNode(doc, { parentId: rootId, node: a })
  const withAB = addNode(withA, { parentId: rootId, node: b })

  const moved = (await import('../ops')).moveNode(withAB, {
    nodeId: a.id,
    fromParentId: rootId,
    toParentId: rootId,
    toIndex: 1,
  })

  expect(moved.childrenMap[rootId]).toEqual([b.id, a.id])
})

it('moveNode moves across parents', async () => {
  const doc = createEmptyDocument()
  const rootId = doc.rootId

  const p1: NodeDTO = { id: asNodeId('p1'), type: asComponentId('Box'), props: {} }
  const p2: NodeDTO = { id: asNodeId('p2'), type: asComponentId('Box'), props: {} }
  const c: NodeDTO = { id: asNodeId('c'), type: asComponentId('Box'), props: {} }

  const withP1 = addNode(doc, { parentId: rootId, node: p1 })
  const withP12 = addNode(withP1, { parentId: rootId, node: p2 })
  const withC = addNode(withP12, { parentId: p1.id, node: c })

  const { moveNode } = await import('../ops')

  const moved = moveNode(withC, {
    nodeId: c.id,
    fromParentId: p1.id,
    toParentId: p2.id,
    toIndex: 0,
  })

  expect(moved.childrenMap[p1.id]).toEqual([])
  expect(moved.childrenMap[p2.id]).toEqual([c.id])
})

it('moveNode rejects moving into its own subtree', async () => {
  const doc = createEmptyDocument()
  const rootId = doc.rootId

  const p: NodeDTO = { id: asNodeId('p'), type: asComponentId('Box'), props: {} }
  const c: NodeDTO = { id: asNodeId('c'), type: asComponentId('Box'), props: {} }

  const withP = addNode(doc, { parentId: rootId, node: p })
  const withPC = addNode(withP, { parentId: p.id, node: c })

  const { moveNode } = await import('../ops')

  expect(() =>
    moveNode(withPC, {
      nodeId: p.id,
      fromParentId: rootId,
      toParentId: c.id,
      toIndex: 0,
    })
  ).toThrow(/subtree/)
})
