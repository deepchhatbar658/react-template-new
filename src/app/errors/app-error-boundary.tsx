import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught application error', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="fatal-error">
          <p className="eyebrow">Application error</p>
          <h1>The application could not continue.</h1>
          <p>
            Reload the page. If the problem persists, share the console error
            with the team.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload application
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
