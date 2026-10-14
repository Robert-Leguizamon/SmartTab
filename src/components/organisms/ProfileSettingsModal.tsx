import React, { useState } from 'react';
import {
  Check,
  Chrome,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  LogOut,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../atoms/Button';

export const ProfileSettingsModal: React.FC = () => {
  const { user, token, isSettingsOpen, setIsSettingsOpen, signOut } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showFullToken, setShowFullToken] = useState(false);

  if (!isSettingsOpen || !user) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app-url';
  const displayToken = token || 'No active session token found';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        id="profile-settings-modal"
        className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/50">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">User Profile & Extension Token</h3>
              <p className="text-xs text-neutral-400">Manage your Supabase credentials & Chrome Extension access</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Info */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Logged in as</span>
            <span className="font-mono text-neutral-200 font-semibold">{user.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Supabase User ID</span>
            <span className="font-mono text-[11px] text-neutral-400 select-all">{user.id}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Multi-Tenant Isolation</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium font-mono">
              <Shield className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* Extension Token Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Chrome Extension Access Token
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFullToken(!showFullToken)}
                className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
              >
                {showFullToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showFullToken ? 'Hide' : 'Reveal'}</span>
              </button>
              <button
                id="btn-copy-extension-token"
                type="button"
                onClick={() => {
                  if (token) {
                    navigator.clipboard.writeText(token);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono font-medium transition-colors"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Copied!' : 'Copy Token'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 break-all select-all leading-relaxed max-h-24 overflow-y-auto">
              {showFullToken ? displayToken : `${displayToken.substring(0, 32)}••••••••••••••••••••••••`}
            </div>
          </div>
        </div>

        {/* API Endpoint for Extension */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              API Base URL
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(currentOrigin);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-emerald-400 select-all">
            {currentOrigin}
          </div>
        </div>

        {/* Quick Instructions Card */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2 text-xs text-neutral-300">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold">
            <Chrome className="w-4 h-4 text-indigo-400" />
            <span>How to Connect Chrome Extension:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 text-[11px] leading-relaxed">
            <li>Open the Smart Tab Archive Chrome Extension popup or settings.</li>
            <li>Paste the <strong className="text-neutral-200">API Base URL</strong> above into the Server URL field.</li>
            <li>Paste the <strong className="text-neutral-200">Access Token</strong> above into the Authorization field.</li>
            <li>Click Save to archive any tab with 1-click directly into your account!</li>
          </ol>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <Button
            id="btn-profile-signout"
            variant="danger"
            size="sm"
            onClick={() => {
              signOut();
              setIsSettingsOpen(false);
            }}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSettingsOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
