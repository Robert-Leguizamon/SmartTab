import React from 'react';
import { Bot, Cpu, Database, RefreshCw } from 'lucide-react';
import { useArchiveStatsQuery } from '../../api/archiveApi';
import { useArchiveStore } from '../../store/useArchiveStore';

export const StatsHeader: React.FC = () => {
  const { data: stats, isLoading, refetch, isRefetching } = useArchiveStatsQuery();
  const { setIsPgVectorModalOpen, setIsChatOpen } = useArchiveStore();

  const totalArchives = stats?.totalCount ?? 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-neutral-200 font-medium">Gemini 1.5/3.7 Flash & text-embedding-004</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Archives:</span>
          <strong className="text-neutral-200">{isLoading ? '0' : totalArchives}</strong>
        </div>

        <div className="hidden md:flex items-center gap-1.5 font-mono">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>768-dim Vector Index:</span>
          <span className="text-emerald-400 font-semibold">IVFFlat Cosine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="btn-open-pgvector-schema"
          onClick={() => setIsPgVectorModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 transition-colors text-xs cursor-pointer"
          title="View pgvector SQL schema and vector metrics"
        >
          <Database className="w-3 h-3 text-indigo-400" />
          <span>pgvector SQL</span>
        </button>

        <button
          id="btn-trigger-ai-copilot"
          onClick={() => setIsChatOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition-colors text-xs cursor-pointer"
        >
          <Bot className="w-3 h-3 text-indigo-400" />
          <span>Chat Copilot</span>
        </button>

        <button
          id="btn-refresh-database"
          onClick={() => refetch()}
          className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
          title="Refresh database records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
