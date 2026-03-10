import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('increments counter when clicking +1', () => {
    render(<App />)

    const counter = screen.getByTestId('counter')
    expect(counter).toHaveTextContent('0')

    fireEvent.click(screen.getByRole('button', { name: '+1' }))
    expect(counter).toHaveTextContent('1')
  })
})
