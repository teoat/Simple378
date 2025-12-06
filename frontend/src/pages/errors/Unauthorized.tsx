import { Link } from 'react-router-dom';
import { LogIn, ArrowLeft, LockKeyhole, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Animated 401 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 leading-none">
            401
          </div>
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <LockKeyhole className="h-24 w-24 text-white/20" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Authentication Required
        </h1>
        <p className="text-slate-400 mb-8 text-lg">
          You need to be logged in to access this page. 
          Please sign in to continue.
        </p>

        {/* Session Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 text-left">
          <h3 className="text-blue-400 font-semibold mb-2">Session Status</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• Your session may have expired</li>
            <li>• You may have been logged out from another device</li>
            <li>• Please log in again to continue</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
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
