import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
          <h2 className="text-lg font-semibold text-red-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-800">
            Refresh the page and try again. Your account data remains protected in Supabase.
          </p>
        </section>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
