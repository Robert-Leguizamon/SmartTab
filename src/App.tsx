/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/organisms/AuthView';
import { MainLayout } from './components/templates/MainLayout';
import { ArchiveDashboardPage } from './pages/ArchiveDashboardPage';
import { Bookmark, Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-950/60">
          <Bookmark className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Verifying Supabase Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <MainLayout>
      <ArchiveDashboardPage />
    </MainLayout>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
