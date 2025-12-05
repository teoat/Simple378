import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'method' | 'setup' | 'verify' | 'complete'>('method');
  const [method, setMethod] = useState<'totp' | 'sms' | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: async (selectedMethod: 'totp' | 'sms') => {
      const response = await api.setup2FA(selectedMethod);
      return response;
    },
    onSuccess: (data) => {
      if (method === 'totp') {
        setQrCode(data.qr_code || null);
        setSecret(data.secret || null);
      }
      setStep('verify');
    },
    onError: (error) => {
      toast.error(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.verify2FA({
        code: verificationCode,
        method: method || 'totp',
      });
      return response;
    },
    onSuccess: (data) => {
      setBackupCodes(data.backup_codes || []);
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('2FA enabled successfully!');
      onComplete?.();
    },
    onError: (error) => {
      toast.error(`Verification failed: ${error instanceof Error ? error.message : 'Invalid code'}`);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Choose Method */}
      {step === 'method' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Choose Authentication Method</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setMethod('totp');
                setupMutation.mutate('totp');
              }}
              disabled={setupMutation.isPending}
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left disabled:opacity-50"
            >
              <div className="font-medium text-slate-900 dark:text-white">Authenticator App</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Use Google Authenticator or similar app
              </div>
            </button>

            <button
              onClick={() => {
                setMethod('sms');
                setupMutation.mutate('sms');
              }}
              disabled={setupMutation.isPending}
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left disabled:opacity-50"
            >
              <div className="font-medium text-slate-900 dark:text-white">SMS</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Receive codes via SMS to your phone
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Setup TOTP */}
      {step === 'verify' && method === 'totp' && qrCode && secret && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Scan QR Code</h3>
          
          <div className="bg-white p-4 rounded-lg">
            <img src={qrCode} alt="2FA QR Code" className="w-full" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Or enter this code manually:</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                {secret}
              </code>
              <button
                onClick={() => copyToClipboard(secret)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-white mb-3">Enter Verification Code</h4>
            <input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full text-center text-2xl tracking-widest font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Step 2: Setup SMS */}
      {step === 'verify' && method === 'sms' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Enter Verification Code</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We&apos;ve sent a code to your registered phone number. Enter it below to verify.
          </p>
          
          <input
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="w-full text-center text-2xl tracking-widest font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
        </div>
      )}

      {/* Step 3: Backup Codes */}
      {step === 'complete' && backupCodes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">2FA Enabled Successfully</h3>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <div className="flex gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-200">Save Your Backup Codes</h4>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  Keep these codes in a safe place. You can use them to access your account if you lose access to your 2FA device.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
            {backupCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between">
                <code className="font-mono text-sm">{code}</code>
                <button
                  onClick={() => copyToClipboard(code)}
                  className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        {step === 'method' && (
          <button
            disabled={setupMutation.isPending}
            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        
        {step === 'verify' && (
          <>
            <button
              onClick={() => setStep('method')}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={verificationCode.length !== 6 || verifyMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
            </button>
          </>
        )}
        
        {step === 'complete' && (
          <button
            onClick={onComplete}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
