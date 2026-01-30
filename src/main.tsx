import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '600px',
            margin: '2rem auto',
          }}
        >
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Une erreur s&apos;est produite</h1>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px',
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Vérifiez la console du navigateur (F12) pour plus de détails.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
