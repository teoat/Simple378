import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
