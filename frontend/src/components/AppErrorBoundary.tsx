import { Component, type ReactNode } from 'react'

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  render() {
    if (this.state.failed) return <main className="onboarding-shell">
      <section className="card">
        <h1>Let’s reopen your space.</h1>
        <p role="alert" className="muted my-5">This screen could not load. Reload the app to try again. Your saved accounts and history stay in this browser.</p>
        <button type="button" className="button button-primary" onClick={() => window.location.reload()}>Reload app</button>
      </section>
    </main>
    return this.props.children
  }
}
