export type SourceType = 'AI_CHAT' | 'YOUTUBE_VIDEO' | 'ARTICLE' | 'OTHER';

export interface ArchiveAnalysis {
  mainIdea: string;
  summary: string[];
  topicCategory: string;
  tags: string[];
  sourceType: SourceType;
  keyTakeaways?: string[];
  sentimentOrTone?: string;
  estimatedReadingMinutes?: number;
}

export interface ArchiveItem extends ArchiveAnalysis {
  id: string;
  userId?: string;
  url: string;
  title: string;
  rawContent?: string;
  domain: string;
  favicon?: string;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  notes?: string;
  similarityScore?: number;
}

export interface IngestArchiveRequest {
  url: string;
  title?: string;
  rawContent?: string;
  sourceType?: SourceType;
  notes?: string;
}

export interface SearchQueryRequest {
  query: string;
  sourceType?: SourceType | 'ALL';
  topicCategory?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month';
  threshold?: number;
  limit?: number;
}

export interface SearchResponse {
  results: ArchiveItem[];
  queryEmbeddingGenerated: boolean;
  totalFound: number;
  searchType: 'hybrid_vector' | 'fallback_keyword';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citedArchiveIds?: string[];
  citedArchives?: Array<{
    id: string;
    title: string;
    url: string;
    sourceType: SourceType;
    snippet: string;
  }>;
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  filterCategory?: string;
}

export interface ArchiveStats {
  totalCount: number;
  bySourceType: Record<SourceType, number>;
  byCategory: Record<string, number>;
  popularTags: Array<{ tag: string; count: number }>;
  recentCount: number;
}
