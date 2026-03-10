import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the five-region editor shell structure', () => {
    render(<App />)

    expect(screen.getByRole('main', { name: 'Editor shell' })).toBe(
      screen.getByTestId('editor-shell')
    )

    expect(screen.getByTestId('editor-topbar')).toHaveAttribute('aria-label', 'Editor top bar')
    expect(screen.getByLabelText('Editor left panel')).toBe(screen.getByTestId('editor-left-panel'))
    expect(screen.getByLabelText('Editor canvas area')).toBe(
      screen.getByTestId('editor-canvas-area')
    )
    expect(screen.getByLabelText('Editor right panel')).toBe(
      screen.getByTestId('editor-right-panel')
    )
    expect(screen.getByTestId('editor-status-bar')).toHaveAttribute(
      'aria-label',
      'Editor status bar'
    )
  })

  it('shows readable placeholder content in each region', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Editor Workspace' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Left Panel' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Canvas Area' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Right Panel' })).toBeVisible()
    expect(screen.getByText('Shell ready. No canvas document is loaded yet.')).toBeVisible()
  })
})
