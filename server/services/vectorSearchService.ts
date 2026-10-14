import { ArchiveItem, SearchQueryRequest, SearchResponse } from '../../shared/types';
import { db } from '../db/database';
import { generateTextEmbedding } from './embeddingService';
import { cosineSimilarity } from './vectorMath';

export async function performHybridSearch(params: SearchQueryRequest, userId?: string): Promise<SearchResponse> {
  const { query, sourceType, topicCategory, dateRange, limit = 20 } = params;
  const allItems = await db.getAll(userId);

  // 1. Generate query embedding
  const { embedding: queryVector, isModelGenerated } = await generateTextEmbedding(query);

  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const now = Date.now();
  const scoredItems: Array<{ item: ArchiveItem; score: number }> = [];

  for (const item of allItems) {
    // Filter by source type
    if (sourceType && sourceType !== 'ALL' && item.sourceType !== sourceType) {
      continue;
    }

    // Filter by topic category
    if (topicCategory && topicCategory !== 'ALL' && item.topicCategory !== topicCategory) {
      continue;
    }

    // Filter by date range
    if (dateRange && dateRange !== 'all') {
      const itemTime = new Date(item.createdAt).getTime();
      const ageMs = now - itemTime;
      if (dateRange === 'today' && ageMs > 24 * 60 * 60 * 1000) continue;
      if (dateRange === 'week' && ageMs > 7 * 24 * 60 * 60 * 1000) continue;
      if (dateRange === 'month' && ageMs > 30 * 24 * 60 * 60 * 1000) continue;
    }

    // Compute Vector Cosine Similarity
    let vectorSim = 0;
    if (item.embedding && item.embedding.length === queryVector.length) {
      vectorSim = cosineSimilarity(queryVector, item.embedding);
    }

    // Compute Lexical / Keyword Match Boost
    const searchableText = `${item.title} ${item.mainIdea} ${item.summary.join(' ')} ${item.tags.join(' ')} ${item.topicCategory}`.toLowerCase();
    let keywordMatches = 0;
    for (const term of queryTerms) {
      if (searchableText.includes(term)) {
        keywordMatches += 1;
      }
    }
    const keywordBoost = queryTerms.length > 0 ? keywordMatches / queryTerms.length : 0;

    // Hybrid combination: 65% vector similarity + 35% exact keyword match
    // Map cosine similarity from [-1, 1] to [0, 1]
    const normalizedVectorSim = Math.max(0, (vectorSim + 1) / 2);
    const hybridScore = normalizedVectorSim * 0.65 + keywordBoost * 0.35;

    scoredItems.push({
      item: {
        ...item,
        similarityScore: Number(hybridScore.toFixed(4)),
      },
      score: hybridScore,
    });
  }

  // Sort descending by score
  scoredItems.sort((a, b) => b.score - a.score);

  const results = scoredItems.slice(0, limit).map((s) => s.item);

  return {
    results,
    queryEmbeddingGenerated: isModelGenerated,
    totalFound: scoredItems.length,
    searchType: isModelGenerated ? 'hybrid_vector' : 'fallback_keyword',
  };
}
