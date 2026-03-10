import React from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the five-region editor shell structure', () => {
    render(<App />)

    const shell = screen.getByRole('main', { name: 'Editor Workspace' })
    expect(shell).toBe(screen.getByTestId('editor-shell'))

    expect(screen.getByRole('banner', { name: 'Editor top bar' })).toBe(
      screen.getByTestId('editor-topbar')
    )
    expect(screen.getByRole('complementary', { name: 'Left Panel' })).toBe(
      screen.getByTestId('editor-left-panel')
    )
    expect(screen.getByRole('region', { name: 'Canvas Area' })).toBe(
      screen.getByTestId('editor-canvas')
    )
    expect(screen.getByRole('complementary', { name: 'Right Panel' })).toBe(
      screen.getByTestId('editor-right-panel')
    )
    expect(screen.getByRole('contentinfo', { name: 'Editor status bar' })).toBe(
      screen.getByTestId('editor-statusbar')
    )
  })

  it('shows readable placeholder content in each region', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Editor Workspace' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Left Panel' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Canvas Area' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Right Panel' })).toBeVisible()
    expect(
      screen.getByText('Top bar placeholder for project context and global actions.')
    ).toBeVisible()
    expect(screen.getByText('Shell ready. No canvas document is loaded yet.')).toBeVisible()
  })

  it('keeps a stable responsive breakpoint hook in the stylesheet', () => {
    const css = readFileSync(resolve(__dirname, 'index.css'), 'utf8')

    expect(css).toContain('--editor-shell-stack-breakpoint: 900px;')
    expect(css).toContain('@media (max-width: 900px)')
    expect(css).toContain('.editor-shell__body')
  })
})
