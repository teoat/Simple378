import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Lock, Chrome, Building2, Smartphone, Mail, Key } from 'lucide-react';
import { PasswordlessModal } from './PasswordlessModal';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPasswordlessModal, setShowPasswordlessModal] = useState(false);
  const { login } = useAuth();

  // SSO Handlers
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth - needs OAuth provider configuration
      toast.error('Google OAuth not yet implemented');
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Microsoft OAuth - needs OAuth provider configuration
      toast.error('Microsoft OAuth not yet implemented');
    } catch (error) {
      console.error('Microsoft login failed:', error);
      toast.error('Microsoft login failed');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-200">
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
              aria-describedby={getEmailError() ? "email-error" : undefined}
              aria-invalid={!!getEmailError()}
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                ${getEmailError() 
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-visible:ring-blue-500'
                }`}
              placeholder="name@example.com"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {touched.email && !getEmailError() && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {getEmailError() && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <AnimatePresence>
            {getEmailError() && (
              <motion.p
                id="email-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500 font-medium flex items-center gap-1"
              >
                {getEmailError()}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-slate-200">
              Password
            </label>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
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
              aria-describedby={getPasswordError() ? "password-error" : undefined}
              aria-invalid={!!getPasswordError()}
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10
                ${getPasswordError() 
                  ? 'border-red-500 focus-visible:ring-red-500 bg-red-50/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-visible:ring-blue-500'
                }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence>
            {getPasswordError() && (
              <motion.p
                id="password-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500 font-medium flex items-center gap-1"
              >
                {getPasswordError()}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 h-10 px-4 py-2 w-full"
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

        {/* Divider */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* SSO Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 h-10 px-4 py-2 w-full text-slate-900 dark:text-slate-100"
          >
            <Chrome className="h-4 w-4 mr-2" />
            Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 h-10 px-4 py-2 w-full text-slate-900 dark:text-slate-100"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Microsoft
          </motion.button>
        </div>

        {/* Passwordless Authentication */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowPasswordlessModal(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Try passwordless sign in
          </button>
        </div>
      </form>

      {/* Passwordless Modal */}
      <PasswordlessModal
        isOpen={showPasswordlessModal}
        onClose={() => setShowPasswordlessModal(false)}
      />
    </div>
  );
}
