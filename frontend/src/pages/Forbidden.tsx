import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-full">
            <ShieldAlert className="w-24 h-24 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
            403
          </h1>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Access Forbidden
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
            You don't have permission to access this resource.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            If you believe this is an error, please contact your administrator.
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
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
