import React from 'react';
import { Calendar, Filter, Heart } from 'lucide-react';
import { DateRangeOption, useArchiveStore } from '../../store/useArchiveStore';

const CATEGORIES = [
  'ALL',
  'AI & Machine Learning',
  'Software Engineering',
  'Frontend & UI',
  'Productivity & Leadership',
  'DevOps & Cloud',
  'Science & Technology',
  'General',
];

const DATE_OPTIONS: Array<{ id: DateRangeOption; label: string }> = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Past 24h' },
  { id: 'week', label: 'Past 7d' },
  { id: 'month', label: 'Past 30d' },
];

export const CategoryFilterBar: React.FC<{ categoryCounts?: Record<string, number> }> = ({ categoryCounts }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    dateRange,
    setDateRange,
    onlyFavorites,
    setOnlyFavorites,
  } = useArchiveStore();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
        <span className="shrink-0 flex items-center gap-1 text-xs text-neutral-500 mr-1">
          <Filter className="w-3 h-3" /> Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = categoryCounts ? (cat === 'ALL' ? undefined : categoryCounts[cat]) : undefined;

          return (
            <button
              key={cat}
              id={`filter-category-${cat.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border cursor-pointer ${
                isActive
                  ? 'bg-neutral-200 text-neutral-900 border-white font-semibold'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border-neutral-750'
              }`}
            >
              <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-[10px] px-1 rounded-sm font-mono ${
                    isActive ? 'bg-neutral-300 text-neutral-900' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Date Range & Favorites Controls */}
      <div className="flex items-center gap-2">
        <button
          id="filter-favorites-toggle"
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            onlyFavorites
              ? 'bg-rose-950/70 text-rose-300 border-rose-700/60'
              : 'bg-neutral-900/80 text-neutral-400 border-neutral-750 hover:text-neutral-200'
          }`}
          title="Filter saved favorites"
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-400 text-rose-400' : ''}`} />
          <span>Favorites</span>
        </button>

        <div className="flex items-center gap-1 bg-neutral-900/80 border border-neutral-750 rounded-lg p-0.5 text-xs text-neutral-400">
          <Calendar className="w-3.5 h-3.5 ml-2 text-neutral-500" />
          <select
            id="filter-date-range-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
            className="bg-transparent text-neutral-200 text-xs px-2 py-1 focus:outline-hidden cursor-pointer"
          >
            {DATE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-neutral-900 text-neutral-100">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
