import React, { useEffect, useState } from 'react';
import { Columns3, Inbox, LayoutGrid, Plus, Search, Table2 } from 'lucide-react';
import { ArchiveItem } from '../../shared/types';
import { searchArchivesApi, useArchivesQuery, useArchiveStatsQuery } from '../api/archiveApi';
import { Spinner } from '../components/atoms/Spinner';
import { CategoryFilterBar } from '../components/molecules/CategoryFilterBar';
import { SearchBar } from '../components/molecules/SearchBar';
import { SourceTypeFilter } from '../components/molecules/SourceTypeFilter';
import { StatsHeader } from '../components/molecules/StatsHeader';
import { ArchiveCard } from '../components/organisms/ArchiveCard';
import { ArchiveDetailModal } from '../components/organisms/ArchiveDetailModal';
import { ArchiveKanban } from '../components/organisms/ArchiveKanban';
import { ArchiveTable } from '../components/organisms/ArchiveTable';
import { ConversationalAssistantDrawer } from '../components/organisms/ConversationalAssistantDrawer';
import { IngestionModal } from '../components/organisms/IngestionModal';
import { PgVectorModal } from '../components/organisms/PgVectorModal';
import { useArchiveStore } from '../store/useArchiveStore';

export const ArchiveDashboardPage: React.FC = () => {
  const {
    searchQuery,
    selectedSourceType,
    selectedCategory,
    dateRange,
    viewMode,
    setViewMode,
    onlyFavorites,
    setIsIngestModalOpen,
    resetFilters,
  } = useArchiveStore();

  const { data: initialArchives, isLoading: isListLoading, refetch } = useArchivesQuery(
    selectedCategory,
    selectedSourceType,
    onlyFavorites
  );
  const { data: stats } = useArchiveStatsQuery();

  const [searchResults, setSearchResults] = useState<ArchiveItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Trigger hybrid vector search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await searchArchivesApi({
          query: searchQuery.trim(),
          sourceType: selectedSourceType,
          topicCategory: selectedCategory,
          dateRange: dateRange,
        });
        setSearchResults(response.results);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSourceType, selectedCategory, dateRange]);

  // Display items: either search results or filtered list
  const displayItems = React.useMemo(() => {
    let items = searchResults !== null ? searchResults : initialArchives || [];
    if (onlyFavorites) {
      items = items.filter((i) => i.isFavorite);
    }
    return items;
  }, [searchResults, initialArchives, onlyFavorites]);

  const isLoading = isListLoading || isSearching;
  const isDatabaseEmpty = (stats?.totalCount === 0 || (!initialArchives || initialArchives.length === 0)) && !searchQuery;

  return (
    <div className="space-y-6">
      {/* Telemetry & Vector System Status Header */}
      <StatsHeader />

      {/* Semantic Natural Language Search Bar */}
      <SearchBar />

      {/* Filter Section: Source Types & Categories (only show when archives exist or filtering) */}
      {(stats?.totalCount || 0) > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-850/80 border border-neutral-750/80 space-y-3">
          <SourceTypeFilter counts={stats?.bySourceType} />
          <CategoryFilterBar categoryCounts={stats?.byCategory} />
        </div>
      )}

      {/* View Switcher & Result Count Bar */}
      {!isDatabaseEmpty && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">{displayItems.length}</span>
            <span>{displayItems.length === 1 ? 'archived tab' : 'archived tabs'}</span>
            {searchQuery && (
              <span className="text-indigo-400 font-mono">
                (Vector match for &ldquo;{searchQuery}&rdquo;)
              </span>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-neutral-850 border border-neutral-750 rounded-xl p-1">
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-kanban"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Kanban Board View (Grouped by Topic)"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              id="view-mode-table"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Table View"
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {isLoading && displayItems.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-neutral-400 font-mono">Querying Supabase PostgreSQL & vector embeddings...</p>
        </div>
      ) : isDatabaseEmpty ? (
        /* Clean Empty State Screen requested by user */
        <div
          id="empty-state-container"
          className="py-20 px-6 text-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/50 max-w-2xl mx-auto space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-neutral-100">No archived tabs yet</h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              Use the Chrome Extension or the &lsquo;+ Archive&rsquo; button above to save your first tab with Gemini analysis.
            </p>
          </div>
          <div className="pt-2">
            <button
              id="btn-empty-state-archive"
              onClick={() => setIsIngestModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Archive Your First Tab</span>
            </button>
          </div>
        </div>
      ) : displayItems.length === 0 ? (
        /* No search results empty state */
        <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 space-y-4">
          <Search className="w-8 h-8 text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-200">No matching archived tabs</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              No results found for &ldquo;{searchQuery}&rdquo;. Try adjusting your keywords or clearing the active filters.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Archive New Tab
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayItems.map((item) => (
            <ArchiveCard key={item.id} item={item} onRefresh={refetch} />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <ArchiveKanban items={displayItems} onRefresh={refetch} />
      ) : (
        <ArchiveTable items={displayItems} onRefresh={refetch} />
      )}

      {/* Modals and Side Drawers */}
      <IngestionModal onArchiveCreated={refetch} />
      <ArchiveDetailModal onUpdate={refetch} />
      <ConversationalAssistantDrawer />
      <PgVectorModal />
    </div>
  );
};
