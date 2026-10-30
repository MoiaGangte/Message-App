import React, { useState } from 'react';
import { ShieldCheck, Handshake, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onSignInWithGoogle: () => Promise<void>;
  loading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignInWithGoogle,
  loading,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    try {
      await onSignInWithGoogle();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError?.code === 'auth/popup-closed-by-user') {
        setError(
          'The Google sign-in window was closed before completing authentication. Please click "Continue with Google" again to complete sign-in.'
        );
      } else if (firebaseError?.code === 'auth/popup-blocked') {
        setError(
          'Your browser blocked the Google sign-in pop-up window. Please enable pop-ups for this site or open the app in a new tab.'
        );
      } else if (firebaseError?.code === 'auth/cancelled-popup-request') {
        setError('A previous sign-in attempt was in progress. Please try again.');
      } else {
        const msg = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#09131F] flex flex-col justify-between selection:bg-[#1976F2] selection:text-white font-sans">
      {/* Top Navy Header Banner */}
      <header className="h-56 bg-[#0B1F3A] w-full px-6 sm:px-12 pt-8 flex items-start shadow-sm border-b border-[#132C4F]">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1976F2] to-[#1259BA] flex items-center justify-center font-extrabold text-xl shadow-md">
              N
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">NicheTrade</h1>
              <p className="text-[11px] text-blue-200/80 font-medium">Marketplace Messaging Platform</p>
            </div>
          </div>
          <span className="text-xs text-white/80 font-medium px-3 py-1 rounded-full bg-white/10 hidden sm:inline-block border border-white/10">
            Escrow Protected
          </span>
        </div>
      </header>

      {/* Main Floating Card */}
      <main className="flex-1 -mt-24 px-4 sm:px-6 pb-12 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white dark:bg-[#0F1D2F] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10">
          {/* Left Details & Login CTA */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#1976F2] text-xs font-bold mb-3 border border-blue-200 dark:border-blue-900/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Buyer & Seller Protection
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Sign in to NicheTrade
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Negotiate peer-to-peer deals, create formal offers, and converse securely with verified collectors and traders.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Make binding offers with escrow protection and safe meetups</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Instant real-time messaging with image sharing and delivery receipts</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Verified seller ratings and structured transaction logs</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="pt-2">
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-[#0B1728] hover:bg-slate-50 dark:hover:bg-[#132238] text-slate-800 dark:text-slate-100 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#1976F2] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign In with Google</span>
              </button>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0B1F3A] to-[#122B4E] text-white rounded-2xl border border-slate-700 shadow-inner w-full md:w-80 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1976F2] to-blue-700 flex items-center justify-center font-black text-3xl shadow-lg mb-4">
              N
            </div>
            <h3 className="font-bold text-base">Trade with Confidence</h3>
            <p className="text-xs text-blue-200/80 mt-1">
              Protected transactions, verified user profiles, and formal offer workflows.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 w-full flex items-center justify-center gap-2 text-xs text-blue-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Bank-grade Firestore Security</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        <p>© 2026 NicheTrade Marketplace Systems • All rights reserved</p>
      </footer>
    </div>
  );
};
