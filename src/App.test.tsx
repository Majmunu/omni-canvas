import React from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the five-region editor shell structure', () => {
    render(<App />)

    const shell = screen.getByRole('main', { name: 'Editor shell' })
    expect(shell).toBe(screen.getByTestId('editor-shell'))
    expect(shell).toHaveClass('editor-shell')

    expect(screen.getByTestId('editor-topbar')).toHaveClass('editor-shell__topbar')
    expect(screen.getByLabelText('Editor left panel')).toHaveClass(
      'editor-shell__panel',
      'editor-shell__panel--left'
    )
    expect(screen.getByLabelText('Editor canvas area')).toHaveClass('editor-shell__canvas')
    expect(screen.getByLabelText('Editor right panel')).toHaveClass(
      'editor-shell__panel',
      'editor-shell__panel--right'
    )
    expect(screen.getByTestId('editor-status-bar')).toHaveClass('editor-shell__statusbar')
  })

  it('shows readable placeholder content in each region', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Editor Workspace' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Left Panel' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Canvas Area' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Right Panel' })).toBeVisible()
    expect(screen.getByText('Shell ready. No canvas document is loaded yet.')).toBeVisible()
  })

  it('keeps a stable responsive breakpoint hook in the stylesheet', () => {
    const css = readFileSync(resolve(__dirname, 'index.css'), 'utf8')

    expect(css).toContain('--editor-shell-stack-breakpoint: 900px;')
    expect(css).toContain('@media (max-width: 900px)')
    expect(css).toContain('.editor-shell__body')
  })
})
