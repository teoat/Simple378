import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 leading-none">
            404
          </div>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <FileQuestion className="h-24 w-24 text-white/20" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-400 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link 
            to="/cases" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Cases
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
