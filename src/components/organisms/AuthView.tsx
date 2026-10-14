import React, { useState } from 'react';
import { AlertCircle, Bookmark, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../atoms/Button';

export const AuthView: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Invalid login credentials. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      const { error, needsEmailConfirmation } = await signUp(email, password);
      if (error) {
        setErrorMsg(error.message || 'Sign up failed. Please try again.');
        setIsSubmitting(false);
      } else if (needsEmailConfirmation) {
        setSuccessMsg('Account created! Please check your email inbox to confirm your account.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl shadow-indigo-950/60 border border-indigo-400/30">
            <Bookmark className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">Smart Tab Archive</h1>
            <p className="text-xs text-neutral-400 mt-1">
              AI-powered bookmarking with Gemini 2.5 Flash & pgvector
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div
          id="auth-card"
          className="bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              id="tab-mode-signin"
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-mode-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div
              id="auth-error-banner"
              className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              id="auth-success-banner"
              className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-neutral-750 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-neutral-500">Must be at least 6 characters.</p>
              )}
            </div>

            <Button
              id="auth-submit-button"
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isSubmitting}
            >
              {mode === 'signin' ? 'Sign In to Dashboard' : 'Create Supabase Account'}
            </Button>
          </form>

          {/* Multi-tenant security notice */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Tenant Row Level Security</span>
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <Sparkles className="w-3 h-3" />
              <span>Supabase Auth</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
