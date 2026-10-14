import React from 'react';
import { Bookmark, Bot, Database, Key, LogOut, Plus, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useArchiveStore } from '../../store/useArchiveStore';
import { Button } from '../atoms/Button';
import { ProfileSettingsModal } from '../organisms/ProfileSettingsModal';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut, setIsSettingsOpen } = useAuth();
  const { setIsIngestModalOpen, setIsChatOpen, setIsPgVectorModalOpen } = useArchiveStore();

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-950/50 border border-indigo-400/30">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-100 font-sans">
                  Smart Tab Archive
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  Gemini & pgvector
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans hidden sm:block">
                Intelligent link capture, structured summarization & 768-dim semantic search
              </p>
            </div>
          </div>

          {/* Actions & User Auth Nav */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-nav-pgvector"
              onClick={() => setIsPgVectorModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-neutral-100 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>pgvector</span>
            </button>

            <button
              id="btn-nav-copilot"
              onClick={() => setIsChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 shadow-xs transition-colors"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            <Button
              id="btn-nav-ingest-tab"
              variant="primary"
              size="md"
              onClick={() => setIsIngestModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden xs:inline">Archive Tab</span>
              <span className="xs:hidden">Archive</span>
            </Button>

            {/* User Profile & Token Trigger */}
            {user && (
              <div className="flex items-center pl-2 border-l border-neutral-800 gap-1.5">
                <button
                  id="btn-nav-profile-token"
                  onClick={() => setIsSettingsOpen(true)}
                  title={`Logged in as ${user.email} - View Profile & Extension Token`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 hover:text-neutral-100 transition-colors text-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                    {userInitial}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate font-mono text-[11px]">
                    {user.email}
                  </span>
                  <Key className="w-3.5 h-3.5 text-indigo-400 hidden sm:block" />
                </button>

                <button
                  id="btn-nav-signout"
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-750 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Profile & Extension Token Modal */}
      <ProfileSettingsModal />

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-4 bg-neutral-900/90 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-mono text-[11px]">
          <div>Smart Tab Archive • Powered by Supabase Auth & Google Gemini 2.5</div>
          <div className="text-neutral-400">Multi-Tenant PostgreSQL • pgvector cosine similarity</div>
        </div>
      </footer>
    </div>
  );
};
