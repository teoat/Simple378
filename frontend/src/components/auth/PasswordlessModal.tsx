import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Mail, Key, Loader2, CheckCircle2 } from 'lucide-react';

interface PasswordlessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordlessModal({ isOpen, onClose }: PasswordlessModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email' | 'key' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendCode = async () => {
    if (!selectedMethod) return;

    setIsLoading(true);
    try {
      // Simulate passwordless authentication flow
      // In production, this would call backend APIs for SMS/email sending
      const simulateAuth = async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate successful sending
        return {
          success: true,
          message: selectedMethod === 'sms'
            ? `Verification code sent to ${phoneNumber}`
            : `Magic link sent to ${email}`
        };
      };

      const result = await simulateAuth();
      if (result.success) {
        setIsSent(true);
        // In production, would redirect to verification page or show code input
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSent(true);
    } catch (error) {
      console.error('Failed to send code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setPhoneNumber('');
    setEmail('');
    setIsLoading(false);
    setIsSent(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Passwordless Sign In
                </h2>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {!selectedMethod ? (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Choose your preferred authentication method:
                    </p>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMethod('sms')}
                        className="w-full flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">SMS Code</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Send a verification code to your phone
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMethod('email')}
                        className="w-full flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Magic Link</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Send a login link to your email
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMethod('key')}
                        className="w-full flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                          <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Security Key</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Use your hardware security key
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </>
                ) : isSent ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Code Sent!
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      {selectedMethod === 'sms'
                        ? `We've sent a verification code to ${phoneNumber}`
                        : selectedMethod === 'email'
                        ? `We've sent a magic link to ${email}`
                        : 'Please use your security key to sign in'
                      }
                    </p>
                    <button
                      onClick={handleClose}
                      className="w-full bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 rounded-md px-4 py-2 font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {selectedMethod === 'sms' && 'SMS Verification'}
                        {selectedMethod === 'email' && 'Magic Link'}
                        {selectedMethod === 'key' && 'Security Key'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedMethod === 'sms' && 'Enter your phone number to receive a verification code'}
                        {selectedMethod === 'email' && 'Enter your email address to receive a magic link'}
                        {selectedMethod === 'key' && 'Use your hardware security key to sign in'}
                      </p>
                    </div>

                    {selectedMethod === 'sms' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+62 812-3456-7890"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'email' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setSelectedMethod(null)}
                        className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSendCode}
                        disabled={isLoading || (selectedMethod === 'sms' && !phoneNumber) || (selectedMethod === 'email' && !email)}
                        className="flex-1 bg-blue-600 text-white rounded-md px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            {selectedMethod === 'key' ? 'Use Key' : 'Send Code'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}