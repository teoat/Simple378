import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login } = useAuth();

  // Validation Logic
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 6;
  
  const getEmailError = () => {
    if (!touched.email) return null;
    if (!email) return "Email is required";
    if (!isEmailValid) return "Please enter a valid email address";
    return null;
  };

  const getPasswordError = () => {
    if (!touched.password) return null;
    if (!password) return "Password is required";
    if (!isPasswordValid) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      await login(email, password);
    } catch {
      // Error is already handled by toast in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-2">
          Email address
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            disabled={isLoading}
            className={`block w-full rounded-xl border-0 px-4 py-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:opacity-50 transition-all duration-200
              ${getEmailError() 
                ? 'ring-red-500/50 focus:ring-red-500 bg-red-50/10' 
                : 'ring-slate-300/50 dark:ring-slate-600/50 focus:ring-blue-500/50 bg-white/5 backdrop-blur-sm'
              }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {touched.email && !getEmailError() && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {getEmailError() && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
        <AnimatePresence>
          {getEmailError() && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-sm text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {getEmailError()}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            disabled={isLoading}
            className={`block w-full rounded-xl border-0 px-4 py-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:opacity-50 transition-all duration-200 pr-10
              ${getPasswordError() 
                ? 'ring-red-500/50 focus:ring-red-500 bg-red-50/10' 
                : 'ring-slate-300/50 dark:ring-slate-600/50 focus:ring-blue-500/50 bg-white/5 backdrop-blur-sm'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <AnimatePresence>
          {getPasswordError() && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-sm text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {getPasswordError()}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </motion.button>
      </div>
    </form>
  );
}
