import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

import { logger } from '../core/logger'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
  errorInfo: ErrorInfo | null
  resetKey: number
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    errorInfo: null,
    resetKey: 0,
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught error', { error, componentStack: errorInfo.componentStack })
    this.setState({ error, errorInfo })
  }

  private handleReset = () => {
    this.setState({ error: null, errorInfo: null, resetKey: this.state.resetKey + 1 })
  }

  render() {
    const { error, errorInfo, resetKey } = this.state

    if (error) {
      return (
        <main style={{ padding: 16 }}>
          <h1>Something went wrong</h1>
          <p>Try reloading this part of the app.</p>
          <button type="button" onClick={this.handleReset}>
            Retry
          </button>
          <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
            {String(error)}
            {errorInfo ? `\n\n${errorInfo.componentStack}` : ''}
          </pre>
        </main>
      )
    }

    return <div key={resetKey}>{this.props.children}</div>
  }
}
