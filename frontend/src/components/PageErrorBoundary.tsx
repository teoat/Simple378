import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PageErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-md w-full backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {this.props.pageName 
                  ? `An error occurred on the ${this.props.pageName} page.`
                  : 'An unexpected error occurred.'}
              </p>

              {this.state.error && (
                <div className="w-full mb-6 p-4 rounded-lg backdrop-blur-sm bg-red-500/10 border border-red-500/20">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                    {this.state.error.message || 'Unknown error'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 backdrop-blur-md bg-blue-600/90 dark:bg-blue-500/90 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 font-medium border border-blue-400/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                
                <Link
                  to="/dashboard"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 backdrop-blur-md bg-slate-600/90 dark:bg-slate-500/90 text-white rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-all shadow-lg shadow-slate-500/20 font-medium border border-slate-400/20"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="w-full mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-4 rounded-lg backdrop-blur-sm bg-slate-900/50 text-xs text-slate-300 overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

