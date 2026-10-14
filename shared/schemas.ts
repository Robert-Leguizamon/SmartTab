import { z } from 'zod';

export const SourceTypeEnum = z.enum(['AI_CHAT', 'YOUTUBE_VIDEO', 'ARTICLE', 'OTHER']);

export const IngestArchiveSchema = z.object({
  url: z.string().url({ message: 'A valid URL is required' }),
  title: z.string().optional(),
  rawContent: z.string().optional(),
  sourceType: SourceTypeEnum.optional(),
  notes: z.string().optional(),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1, { message: 'Query cannot be empty' }),
  sourceType: z.enum(['ALL', 'AI_CHAT', 'YOUTUBE_VIDEO', 'ARTICLE', 'OTHER']).optional(),
  topicCategory: z.string().optional(),
  dateRange: z.enum(['all', 'today', 'week', 'month']).optional(),
  threshold: z.number().min(0).max(1).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1),
    })
  ).min(1),
  filterCategory: z.string().optional(),
});

export const UpdateArchiveSchema = z.object({
  title: z.string().min(1).optional(),
  mainIdea: z.string().min(1).optional(),
  topicCategory: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  notes: z.string().optional(),
});

export const ExtractUrlSchema = z.object({
  url: z.string().url({ message: 'A valid URL is required' }),
});
