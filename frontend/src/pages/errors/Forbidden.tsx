import { Link } from 'react-router-dom';
import { Home, ShieldX, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Animated 403 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 leading-none">
            403
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop'
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <ShieldX className="h-24 w-24 text-red-500/40" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Access Forbidden
        </h1>
        <p className="text-slate-400 mb-8 text-lg">
          You don't have permission to access this resource.
          Please contact your administrator if you believe this is an error.
        </p>

        {/* Permission Info Card */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 text-left">
          <h3 className="text-red-400 font-semibold mb-2">Why am I seeing this?</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• Your account may not have the required permissions</li>
            <li>• This resource may be restricted to specific roles</li>
            <li>• Your session may have expired</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <a 
            href="mailto:support@company.com" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
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
