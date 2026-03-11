import React from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import App from './App'

beforeAll(() => {
  const style = document.createElement('style')
  style.dataset.testid = 'app-test-styles'
  style.textContent = readFileSync(resolve(__dirname, 'index.css'), 'utf8')
  document.head.append(style)
})

afterAll(() => {
  document.head.querySelector('[data-testid="app-test-styles"]')?.remove()
})

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

  it('marks the five visible regions as independently scrollable surfaces', () => {
    render(<App />)

    expect(screen.getByRole('banner', { name: 'Editor top bar' })).toHaveAttribute(
      'data-scroll-region',
      'true'
    )
    expect(screen.getByRole('complementary', { name: 'Left Panel' })).toHaveAttribute(
      'data-scroll-region',
      'true'
    )
    expect(screen.getByRole('region', { name: 'Canvas Area' })).toHaveAttribute(
      'data-scroll-region',
      'true'
    )
    expect(screen.getByRole('complementary', { name: 'Right Panel' })).toHaveAttribute(
      'data-scroll-region',
      'true'
    )
    expect(screen.getByRole('contentinfo', { name: 'Editor status bar' })).toHaveAttribute(
      'data-scroll-region',
      'true'
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

    // CE-015: panels scaffold
    expect(screen.getByRole('region', { name: 'Palette' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Layers' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Inspector' })).toBeVisible()

    // Palette list (at least some builtin components)
    expect(screen.getByRole('list', { name: 'Palette components' })).toBeVisible()

    // Layers tree renders
    expect(screen.getByRole('list', { name: 'Layers tree' })).toBeVisible()

    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)

    // CE-014: overlay layer scaffold
    expect(screen.getByTestId('overlay-layer')).toBeInTheDocument()
  })

  it('keeps a stable responsive breakpoint hook in computed styles', () => {
    render(<App />)

    expect(getComputedStyle(document.documentElement).getPropertyValue('--editor-breakpoint')).toBe(
      '900px'
    )
  })
})
