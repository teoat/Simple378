import { motion } from 'framer-motion';
import { LoginForm } from '../components/auth/LoginForm';
import { PageErrorBoundary } from '../components/PageErrorBoundary';

/**
 * Login Page
 * 
 * Features:
 * - Animated background effects
 * - Responsive login form
 * - Feature highlights
 */
export function Login() {
  return (
    <PageErrorBoundary pageName="Login">
      <div className="flex min-h-screen flex-1 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 relative">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mt-8 text-3xl font-bold leading-9 tracking-tight text-slate-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sign in to access the AntiGravity Fraud Detection System
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 backdrop-blur-xl bg-white/10 dark:bg-slate-900/10 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/20 p-8"
            >
              <LoginForm />
            </motion.div>
          </div>
        </div>
        
        <div className="relative hidden w-0 flex-1 lg:block">
          <div className="absolute inset-0 h-full w-full bg-slate-900/40 backdrop-blur-sm">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 mix-blend-overlay" />
             <div className="flex h-full items-center justify-center p-12">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.7, delay: 0.2 }}
                 className="max-w-2xl text-center relative z-10 p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
               >
                 <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
                   Advanced Fraud Detection
                 </h1>
                 <p className="text-lg leading-8 text-slate-200">
                   Leverage AI-powered analysis to detect structuring, rapid movement, and entity links in real-time.
                 </p>
               </motion.div>
             </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
