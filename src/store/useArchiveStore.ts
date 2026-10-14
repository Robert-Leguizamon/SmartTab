import { create } from 'zustand';
import { ArchiveItem, SourceType } from '../../shared/types';

export type ViewMode = 'grid' | 'kanban' | 'table';
export type DateRangeOption = 'all' | 'today' | 'week' | 'month';

interface ArchiveState {
  searchQuery: string;
  selectedSourceType: SourceType | 'ALL';
  selectedCategory: string;
  dateRange: DateRangeOption;
  viewMode: ViewMode;
  isIngestModalOpen: boolean;
  isChatOpen: boolean;
  isPgVectorModalOpen: boolean;
  selectedArchive: ArchiveItem | null;
  onlyFavorites: boolean;

  setSearchQuery: (query: string) => void;
  setSelectedSourceType: (type: SourceType | 'ALL') => void;
  setSelectedCategory: (category: string) => void;
  setDateRange: (range: DateRangeOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsIngestModalOpen: (open: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
  setIsPgVectorModalOpen: (open: boolean) => void;
  setSelectedArchive: (item: ArchiveItem | null) => void;
  setOnlyFavorites: (fav: boolean) => void;
  resetFilters: () => void;
}

export const useArchiveStore = create<ArchiveState>((set) => ({
  searchQuery: '',
  selectedSourceType: 'ALL',
  selectedCategory: 'ALL',
  dateRange: 'all',
  viewMode: 'grid',
  isIngestModalOpen: false,
  isChatOpen: false,
  isPgVectorModalOpen: false,
  selectedArchive: null,
  onlyFavorites: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedSourceType: (type) => set({ selectedSourceType: type }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setDateRange: (range) => set({ dateRange: range }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsIngestModalOpen: (open) => set({ isIngestModalOpen: open }),
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  setIsPgVectorModalOpen: (open) => set({ isPgVectorModalOpen: open }),
  setSelectedArchive: (item) => set({ selectedArchive: item }),
  setOnlyFavorites: (fav) => set({ onlyFavorites: fav }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedSourceType: 'ALL',
      selectedCategory: 'ALL',
      dateRange: 'all',
      onlyFavorites: false,
    }),
}));
