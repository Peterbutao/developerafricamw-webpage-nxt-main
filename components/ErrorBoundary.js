import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ fontSize: '1.5rem', color: '#b42318', marginBottom: '1rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#555', marginBottom: '1.5rem' }}>
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#005f95',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}