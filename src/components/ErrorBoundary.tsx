import { Component, type ReactNode } from 'react';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { err?: Error }> {
  state: { err?: Error } = {};
  static getDerivedStateFromError(err: Error) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="mesh flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <pre className="max-w-full overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-card p-3 text-left text-xs">{this.state.err.message}</pre>
        <div className="flex gap-2">
          <button className="rounded-xl bg-primary px-4 py-2 text-primary-fg" onClick={() => location.reload()}>Reload</button>
          <a className="rounded-xl border border-line bg-card px-4 py-2" href="/app/home">Home</a>
        </div>
      </div>
    );
  }
}
