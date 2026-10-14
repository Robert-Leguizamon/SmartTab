import React from 'react';
import { Bot, FileText, Globe, Layers, Youtube } from 'lucide-react';
import { SourceType } from '../../../shared/types';
import { useArchiveStore } from '../../store/useArchiveStore';

interface FilterOption {
  id: SourceType | 'ALL';
  label: string;
  icon: React.ReactNode;
}

const OPTIONS: FilterOption[] = [
  { id: 'ALL', label: 'All Sources', icon: <Layers className="w-4 h-4" /> },
  { id: 'AI_CHAT', label: 'AI Chats', icon: <Bot className="w-4 h-4" /> },
  { id: 'YOUTUBE_VIDEO', label: 'YouTube', icon: <Youtube className="w-4 h-4" /> },
  { id: 'ARTICLE', label: 'Articles', icon: <FileText className="w-4 h-4" /> },
  { id: 'OTHER', label: 'Web Links', icon: <Globe className="w-4 h-4" /> },
];

export const SourceTypeFilter: React.FC<{ counts?: Record<string, number> }> = ({ counts }) => {
  const { selectedSourceType, setSelectedSourceType } = useArchiveStore();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {OPTIONS.map((opt) => {
        const isActive = selectedSourceType === opt.id;
        const count = counts ? (opt.id === 'ALL' ? undefined : counts[opt.id]) : undefined;

        return (
          <button
            key={opt.id}
            id={`filter-source-${opt.id.toLowerCase()}`}
            onClick={() => setSelectedSourceType(opt.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer border ${
              isActive
                ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-sm shadow-indigo-950/50'
                : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border-neutral-750'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-neutral-400'}>{opt.icon}</span>
            <span>{opt.label}</span>
            {typeof count === 'number' && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
