import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CanvasRoot } from '../CanvasRoot'

import type { SavedDocument } from '../../../core/dto/document'
import { asNodeId } from '../../../core/types/id'
import {
  boxComponentId,
  createBuiltinComponentRegistry,
  textComponentId,
} from '../../../core/registry'

describe('renderer/dom', () => {
  it('renders nodes recursively from childrenMap', () => {
    const rootId = asNodeId('root')
    const boxId = asNodeId('box-1')
    const textId = asNodeId('text-1')

    const doc: SavedDocument = {
      version: '0.1.0',
      rootId,
      nodes: {
        [rootId]: { id: rootId, type: 'ROOT', props: {} },
        [boxId]: {
          id: boxId,
          type: boxComponentId,
          props: { width: 111, height: 222 },
        },
        [textId]: { id: textId, type: textComponentId, props: { text: 'Hi' } },
      },
      childrenMap: {
        [rootId]: [boxId],
        [boxId]: [textId],
        [textId]: [],
      },
    }

    render(<CanvasRoot document={doc} registry={createBuiltinComponentRegistry()} />)

    expect(screen.getByTestId('dom-canvas-root')).toBeInTheDocument()
    expect(screen.getByTestId('node-box')).toBeInTheDocument()
    expect(screen.getByTestId('node-text')).toHaveTextContent('Hi')
  })

  it('renders unknown component placeholder', () => {
    const rootId = asNodeId('root')
    const unknownId = asNodeId('unknown-1')

    const doc: SavedDocument = {
      version: '0.1.0',
      rootId,
      nodes: {
        [rootId]: { id: rootId, type: 'ROOT', props: {} },
        [unknownId]: {
          id: unknownId,
          type: 'unknown/component' as unknown as import('../../../core/types').ComponentId,
          props: {},
        },
      },
      childrenMap: {
        [rootId]: [unknownId],
        [unknownId]: [],
      },
    }

    render(<CanvasRoot document={doc} registry={createBuiltinComponentRegistry()} />)

    expect(screen.getByTestId('node-unknown')).toBeInTheDocument()
  })
})
