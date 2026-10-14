import crypto from 'crypto';
import { Request, Response } from 'express';
import { ArchiveItem, ArchiveStats, IngestArchiveRequest, SearchQueryRequest, SourceType } from '../../shared/types';
import { db, isValidUUID, toStringArray } from '../db/database';
import { generateTextEmbedding } from '../services/embeddingService';
import { analyzeContentWithGemini, askGeminiAssistantAboutArchives } from '../services/geminiService';
import { extractUrlMetadata } from '../services/urlScraperService';
import { performHybridSearch } from '../services/vectorSearchService';

function getUserId(req: Request): string | null {
  const id = req.user?.id;
  if (id && isValidUUID(id)) {
    return id;
  }
  return null;
}

export class ArchiveController {
  public static async ingest(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        console.error('[Archive Ingest Error]: Unauthorized - Missing or invalid user_id in authenticated session.');
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Authentication required. Missing valid user_id in session token.',
          error: 'Unauthorized',
        });
        return;
      }

      const { url, title: userTitle, rawContent: userContent, sourceType: userSourceType, notes } = req.body as IngestArchiveRequest;

      // Extract domain and fallback favicon
      let fallbackDomain = 'unknown';
      try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        fallbackDomain = parsed.hostname.replace(/^www\./, '');
      } catch {
        fallbackDomain = 'unknown';
      }

      // Extract metadata from URL
      const urlMeta = await extractUrlMetadata(url);
      const domain = urlMeta.domain || fallbackDomain;
      const favicon = urlMeta.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      const title = userTitle?.trim() || urlMeta.title || domain;
      const rawContent = userContent?.trim() || urlMeta.fullText || urlMeta.excerpt || title;

      // 1. Analyze with Gemini
      const analysis = await analyzeContentWithGemini(url, title, rawContent, userSourceType);

      // Ensure summary, tags, and key takeaways are array of strings
      const normalizedSummary = toStringArray(analysis.summary);
      const finalSummary = normalizedSummary.length > 0 ? normalizedSummary : [`Archived reference from ${domain}`];

      const normalizedTags = toStringArray(analysis.tags);
      const finalTags = normalizedTags.length > 0 ? normalizedTags : [domain, 'Bookmark'];

      const normalizedKeyTakeaways = toStringArray(analysis.keyTakeaways);

      // 2. Generate 768-dim embedding via text-embedding-004
      const textToEmbed = `${title}. ${analysis.mainIdea}. ${finalSummary.join(' ')}. Tags: ${finalTags.join(', ')}. Category: ${analysis.topicCategory}`;
      const { embedding } = await generateTextEmbedding(textToEmbed);

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const newItem: ArchiveItem = {
        id,
        userId,
        url,
        title,
        rawContent,
        domain,
        favicon,
        mainIdea: analysis.mainIdea || `Reference link: ${title}`,
        summary: finalSummary,
        topicCategory: analysis.topicCategory || 'General',
        tags: finalTags,
        sourceType: (analysis.sourceType as SourceType) || 'OTHER',
        keyTakeaways: normalizedKeyTakeaways.length > 0 ? normalizedKeyTakeaways : undefined,
        sentimentOrTone: analysis.sentimentOrTone || 'Informative',
        estimatedReadingMinutes: Number(analysis.estimatedReadingMinutes || 3),
        notes: notes?.trim(),
        isFavorite: false,
        embedding,
        createdAt: now,
        updatedAt: now,
      };

      const saved = await db.insert(newItem, userId);
      res.status(201).json(saved);
    } catch (err) {
      const error = err as Error;
      console.error('[Archive Ingest Exception]:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process and archive link',
        stack: error.stack,
        error: error.message || 'Internal server error',
      });
    }
  }

  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      const searchParams = req.body as SearchQueryRequest;
      const result = await performHybridSearch(searchParams, userId);
      res.json(result);
    } catch (err) {
      const error = err as Error;
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Search operation failed',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async chat(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      const { messages, filterCategory } = req.body;
      const latestMessage = messages[messages.length - 1]?.content || '';

      const searchResult = await performHybridSearch(
        {
          query: latestMessage,
          topicCategory: filterCategory,
          limit: 6,
        },
        userId
      );

      const assistantReply = await askGeminiAssistantAboutArchives(
        latestMessage,
        searchResult.results,
        messages.slice(0, -1)
      );

      const citedArchives = (
        await Promise.all(assistantReply.citedArchiveIds.map((id) => db.getById(id, userId)))
      )
        .filter((a): a is ArchiveItem => a !== undefined)
        .map((a) => ({
          id: a.id,
          title: a.title,
          url: a.url,
          sourceType: a.sourceType,
          snippet: a.mainIdea,
        }));

      res.json({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: assistantReply.answer,
        timestamp: new Date().toISOString(),
        citedArchiveIds: assistantReply.citedArchiveIds,
        citedArchives,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate assistant response',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      const { category, sourceType, favorite } = req.query;
      let items = await db.getAll(userId);

      if (category && category !== 'ALL') {
        items = items.filter((i) => i.topicCategory === category);
      }
      if (sourceType && sourceType !== 'ALL') {
        items = items.filter((i) => i.sourceType === sourceType);
      }
      if (favorite === 'true') {
        items = items.filter((i) => i.isFavorite);
      }

      res.json({ items, total: items.length });
    } catch (err) {
      const error = err as Error;
      console.error('List error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch archives',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      const item = await db.getById(req.params.id, userId);
      if (!item) {
        res.status(404).json({ error: 'Archive not found' });
        return;
      }
      res.json(item);
    } catch (err) {
      const error = err as Error;
      console.error('GetById error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch archive',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      const updated = await db.update(req.params.id, req.body, userId);
      if (!updated) {
        res.status(404).json({ error: 'Archive not found' });
        return;
      }
      res.json(updated);
    } catch (err) {
      const error = err as Error;
      console.error('Update error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update archive',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      const success = await db.delete(req.params.id, userId);
      if (!success) {
        res.status(404).json({ error: 'Archive not found' });
        return;
      }
      res.json({ success: true, id: req.params.id });
    } catch (err) {
      const error = err as Error;
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete archive',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async extractUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;
      const metadata = await extractUrlMetadata(url);
      res.json(metadata);
    } catch (err) {
      const error = err as Error;
      console.error('URL extraction error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to extract URL data',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      const items = await db.getAll(userId);
      const bySourceType: Record<SourceType, number> = {
        AI_CHAT: 0,
        YOUTUBE_VIDEO: 0,
        ARTICLE: 0,
        OTHER: 0,
      };
      const byCategory: Record<string, number> = {};
      const tagCounts: Record<string, number> = {};

      for (const item of items) {
        bySourceType[item.sourceType] = (bySourceType[item.sourceType] || 0) + 1;
        byCategory[item.topicCategory] = (byCategory[item.topicCategory] || 0) + 1;

        for (const tag of item.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }

      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentCount = items.filter((i) => new Date(i.createdAt).getTime() > oneWeekAgo).length;

      const stats: ArchiveStats = {
        totalCount: items.length,
        bySourceType,
        byCategory,
        popularTags,
        recentCount,
      };

      res.json(stats);
    } catch (err) {
      const error = err as Error;
      console.error('Stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to compute stats',
        stack: error.stack,
        error: error.message,
      });
    }
  }

  public static async clearAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing user_id', error: 'Unauthorized' });
        return;
      }
      await db.clearAll(userId);
      res.json({ message: 'All archives cleared successfully' });
    } catch (err) {
      const error = err as Error;
      console.error('ClearAll error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to clear archives',
        stack: error.stack,
        error: error.message,
      });
    }
  }
}
