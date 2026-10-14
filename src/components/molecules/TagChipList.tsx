import React from 'react';
import { Tag } from 'lucide-react';
import { useArchiveStore } from '../../store/useArchiveStore';

interface TagChipListProps {
  tags: string[];
  maxDisplay?: number;
}

export const TagChipList: React.FC<TagChipListProps> = ({ tags, maxDisplay = 5 }) => {
  const { setSearchQuery } = useArchiveStore();
  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {displayTags.map((tag) => (
        <button
          key={tag}
          id={`tag-chip-${tag.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
          onClick={(e) => {
            e.stopPropagation();
            setSearchQuery(tag);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans bg-neutral-800/80 hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 border border-neutral-750 transition-colors cursor-pointer"
          title={`Filter by tag "${tag}"`}
        >
          <Tag className="w-2.5 h-2.5 text-neutral-500" />
          <span>{tag}</span>
        </button>
      ))}

      {remainingCount > 0 && (
        <span className="text-[11px] text-neutral-500 font-mono">+{remainingCount}</span>
      )}
    </div>
  );
};
