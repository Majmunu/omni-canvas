import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the editor shell entry point', () => {
    render(<App />)

    expect(screen.getByTestId('editor-shell')).toHaveAttribute('aria-label', 'Editor shell')
    expect(screen.getByRole('heading', { name: 'Editor Shell' })).toBeVisible()
    expect(
      screen.getByText('Canvas workspace scaffolding will land here in CE-002 Task 2.')
    ).toBeVisible()
  })
})
