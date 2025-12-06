import { useNavigate } from 'react-router-dom';
import { ServerCrash, Home, RefreshCw, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="p-6 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <ServerCrash className="w-24 h-24 text-purple-600 dark:text-purple-400" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-4">
            500
          </h1>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Internal Server Error
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
            Something went wrong on our end. We're working to fix it.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Please try again in a few moments.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Page
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
          
          <a
            href="mailto:support@simple378.com"
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </motion.div>

        {/* Error Details (Optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <details className="inline-block text-left bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/20 dark:border-slate-700/50 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400">
              Technical Details
            </summary>
            <div className="mt-3 text-xs font-mono text-slate-500 dark:text-slate-500 space-y-1">
              <p>Error Code: 500</p>
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>Request ID: {Math.random().toString(36).substring(7)}</p>
            </div>
          </details>
        </motion.div>
      </motion.div>
    </div>
  );
}
