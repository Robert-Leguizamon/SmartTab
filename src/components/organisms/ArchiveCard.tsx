import React from 'react';
import { Clock, ExternalLink, Heart, MoreVertical, Sparkles, Trash2 } from 'lucide-react';
import { ArchiveItem } from '../../../shared/types';
import { deleteArchiveApi, updateArchiveApi } from '../../api/archiveApi';
import { useArchiveStore } from '../../store/useArchiveStore';
import { CategoryBadge, ScoreBadge, SourceBadge } from '../atoms/Badge';
import { TagChipList } from '../molecules/TagChipList';

interface ArchiveCardProps {
  item: ArchiveItem;
  onRefresh?: () => void;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({ item, onRefresh }) => {
  const { setSelectedArchive } = useArchiveStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateArchiveApi({ id: item.id, data: { isFavorite: !item.isFavorite } });
    onRefresh?.();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${item.title}" from archive?`)) {
      await deleteArchiveApi(item.id);
      onRefresh?.();
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setIsMenuOpen(false);
  };

  const handleCardClick = () => {
    setSelectedArchive(item);
  };

  return (
    <div
      id={`archive-card-${item.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-2xl bg-neutral-850/90 hover:bg-neutral-800/95 border border-neutral-750/90 hover:border-indigo-500/50 p-5 shadow-md shadow-black/30 hover:shadow-xl hover:shadow-indigo-950/20 transition-all duration-200 cursor-pointer"
    >
      <div className="space-y-3.5">
        {/* Header: Source, Category & Similarity Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <SourceBadge sourceType={item.sourceType} size="sm" />
            <CategoryBadge category={item.topicCategory} />
          </div>

          <div className="flex items-center gap-1">
            {typeof item.similarityScore === 'number' && item.similarityScore > 0 && (
              <ScoreBadge score={item.similarityScore} />
            )}
            <button
              id={`btn-fav-${item.id}`}
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                item.isFavorite
                  ? 'text-rose-400 hover:text-rose-300'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/60'
              }`}
              title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Direct URL */}
        <div>
          <h3 className="text-base font-semibold text-neutral-100 group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
            {item.favicon && (
              <img
                src={item.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span className="font-mono text-neutral-400 truncate max-w-[200px]">{item.domain}</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-0.5 text-neutral-500 hover:text-indigo-400 transition-colors"
              title="Open source URL in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Main Idea Gemini High-Density Callout */}
        <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-750/70 space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Main Idea</span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed line-clamp-3">{item.mainIdea}</p>
        </div>

        {/* Summary Bullet Points */}
        {item.summary && item.summary.length > 0 && (
          <ul className="space-y-1 text-xs text-neutral-300">
            {item.summary.slice(0, 2).map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5 line-clamp-2">
                <span className="text-indigo-400 font-bold shrink-0 leading-tight">•</span>
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: Tags, Reading time & Action Menu */}
      <div className="mt-4 pt-3.5 border-t border-neutral-750/80 flex items-center justify-between gap-2">
        <TagChipList tags={item.tags} maxDisplay={3} />

        <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
          {item.estimatedReadingMinutes && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span>{item.estimatedReadingMinutes}m</span>
            </span>
          )}

          <div className="relative">
            <button
              id={`btn-card-menu-${item.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/80 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 bottom-full mb-1 w-36 rounded-xl bg-neutral-900 border border-neutral-700 shadow-xl py-1 z-20 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-3 py-1.5 text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Copy URL
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
