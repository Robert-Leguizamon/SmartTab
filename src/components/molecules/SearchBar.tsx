import React from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { useArchiveStore } from '../../store/useArchiveStore';

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsChatOpen } = useArchiveStore();

  return (
    <div className="w-full space-y-2.5">
      <div className="relative flex items-center">
        <div className="absolute left-4 flex items-center pointer-events-none text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input
          id="semantic-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search semantic archives by concept, topic, or natural language query..."
          className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-750 pl-12 pr-28 py-3.5 text-base text-neutral-100 placeholder-neutral-500 shadow-lg shadow-black/40 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => setSearchQuery('')}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              title="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            id="btn-open-assistant-query"
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 text-xs font-medium transition-all cursor-pointer"
            title="Ask Smart Tab Copilot"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
