import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home, Activity, ShieldCheck, Clock3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Offline() {
  const [checking, setChecking] = useState(false);
  const isOnline = useMemo(() => typeof navigator !== 'undefined' ? navigator.onLine : true, []);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        window.location.reload();
      } else {
        setChecking(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-3xl"
      >
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                <WifiOff className="h-6 w-6 text-red-300" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.15em] text-red-200/70">Offline Mode</p>
                <h1 className="text-2xl font-bold">Connection lost</h1>
              </div>
            </div>

            <p className="text-slate-200/80 mb-6 leading-relaxed">
              We could not reach the network. Keep working locally and retry when you are back online.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">Data safe</p>
                  <p className="text-sm text-slate-300/80">Unsaved changes stay on this device until connection returns.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock3 className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <p className="font-semibold text-white">Automatic retry</p>
                  <p className="text-sm text-slate-300/80">We will reconnect as soon as the network is restored.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRetry}
                disabled={checking}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {checking ? 'Checking…' : 'Retry connection'}
              </Button>
              <Link
                to="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go to dashboard
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300/80 mb-4">
                <Activity className="h-4 w-4" />
                Live status
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-ping'}`} />
                <p className="text-lg font-semibold">
                  {isOnline ? 'Back online' : 'Offline detected'}
                </p>
              </div>
              <p className="text-sm text-slate-200/70">
                Last check: just now. We monitor your connection continuously.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200/80">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs uppercase text-slate-300/70 mb-1">Cache mode</p>
                  <p className="font-semibold">Enabled</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs uppercase text-slate-300/70 mb-1">Queued actions</p>
                  <p className="font-semibold">0 pending</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300/80 mb-3">Quick checklist</p>
              <ul className="space-y-2 text-sm text-slate-100/90">
                <li className="flex gap-2"><span>•</span><span>Reconnect to VPN or corporate network.</span></li>
                <li className="flex gap-2"><span>•</span><span>Disable airplane mode and confirm Wi‑Fi is on.</span></li>
                <li className="flex gap-2"><span>•</span><span>If issues persist, contact support with a timestamp.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Offline;
