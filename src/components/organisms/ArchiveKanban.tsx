import React from 'react';
import { Sparkles } from 'lucide-react';
import { ArchiveItem } from '../../../shared/types';
import { ArchiveCard } from './ArchiveCard';

interface ArchiveKanbanProps {
  items: ArchiveItem[];
  groupBy?: 'category' | 'source';
  onRefresh?: () => void;
}

export const ArchiveKanban: React.FC<ArchiveKanbanProps> = ({ items, groupBy = 'category', onRefresh }) => {
  // Group items by category or source
  const columns = React.useMemo(() => {
    const map: Record<string, ArchiveItem[]> = {};

    for (const item of items) {
      const key = groupBy === 'category' ? item.topicCategory : item.sourceType.replace('_', ' ');
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }

    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [items, groupBy]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto pb-4 pt-1">
      <div className="flex items-start gap-4 min-w-max">
        {columns.map(([title, groupItems]) => (
          <div
            key={title}
            id={`kanban-col-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
            className="w-80 shrink-0 flex flex-col rounded-2xl bg-neutral-900/70 border border-neutral-800 p-3.5 space-y-3 shadow-sm"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  {title}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                {groupItems.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar">
              {groupItems.map((item) => (
                <ArchiveCard key={item.id} item={item} onRefresh={onRefresh} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
