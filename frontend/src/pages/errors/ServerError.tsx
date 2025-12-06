import { Link } from 'react-router-dom';
import { Home, RefreshCw, ArrowLeft, ServerCrash, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

interface ServerErrorProps {
  error?: Error;
  resetError?: () => void;
}

export function ServerError({ error, resetError }: ServerErrorProps) {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Animated 500 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 leading-none">
            500
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <ServerCrash className="h-24 w-24 text-white/20" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Internal Server Error
        </h1>
        <p className="text-slate-400 mb-8 text-lg">
          Something went wrong on our servers. Our team has been notified and is working to fix the issue.
        </p>

        {/* Error Details (if available) */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 text-left overflow-hidden"
          >
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
              <AlertTriangle className="h-4 w-4" />
              Error Details
            </div>
            <pre className="text-slate-400 text-xs overflow-x-auto font-mono">
              {error.message}
            </pre>
          </motion.div>
        )}

        {/* Status Info */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Status</p>
              <p className="text-amber-400 font-medium flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Investigating
              </p>
            </div>
            <div>
              <p className="text-slate-500">Error ID</p>
              <p className="text-white font-mono">ERR-XXXXXX</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>

        {/* Back link */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => window.history.back()}
          className="mt-8 text-slate-500 hover:text-white flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back to previous page
        </motion.button>
      </motion.div>
    </div>
  );
}
