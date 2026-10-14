import React from 'react';
import { ExternalLink, Heart, Sparkles } from 'lucide-react';
import { ArchiveItem } from '../../../shared/types';
import { updateArchiveApi } from '../../api/archiveApi';
import { useArchiveStore } from '../../store/useArchiveStore';
import { CategoryBadge, ScoreBadge, SourceBadge } from '../atoms/Badge';
import { TagChipList } from '../molecules/TagChipList';

export const ArchiveTable: React.FC<{ items: ArchiveItem[]; onRefresh?: () => void }> = ({
  items,
  onRefresh,
}) => {
  const { setSelectedArchive } = useArchiveStore();

  const handleToggleFavorite = async (e: React.MouseEvent, item: ArchiveItem) => {
    e.stopPropagation();
    await updateArchiveApi({ id: item.id, data: { isFavorite: !item.isFavorite } });
    onRefresh?.();
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-md">
      <table className="w-full text-left text-xs text-neutral-300">
        <thead className="bg-neutral-850 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
          <tr>
            <th className="py-3 px-4 w-10">Fav</th>
            <th className="py-3 px-4">Title & URL</th>
            <th className="py-3 px-4">Source</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Main Idea</th>
            <th className="py-3 px-4">Tags</th>
            <th className="py-3 px-4 text-right">Score / Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60 font-sans">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => setSelectedArchive(item)}
              className="hover:bg-neutral-800/60 transition-colors cursor-pointer"
            >
              <td className="py-3 px-4">
                <button
                  onClick={(e) => handleToggleFavorite(e, item)}
                  className="text-neutral-500 hover:text-rose-400 p-1"
                >
                  <Heart
                    className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500 text-rose-400' : ''}`}
                  />
                </button>
              </td>
              <td className="py-3 px-4 max-w-xs">
                <div className="font-medium text-neutral-100 line-clamp-1">{item.title}</div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
                  <span>{item.domain}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-indigo-400"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <SourceBadge sourceType={item.sourceType} size="sm" />
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <CategoryBadge category={item.topicCategory} />
              </td>
              <td className="py-3 px-4 max-w-sm">
                <p className="line-clamp-2 text-neutral-300 text-xs">{item.mainIdea}</p>
              </td>
              <td className="py-3 px-4 max-w-xs">
                <TagChipList tags={item.tags} maxDisplay={2} />
              </td>
              <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[11px] text-neutral-400">
                {typeof item.similarityScore === 'number' && item.similarityScore > 0 ? (
                  <ScoreBadge score={item.similarityScore} />
                ) : (
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
