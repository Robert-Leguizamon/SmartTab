import crypto from 'crypto';
import { Pool } from 'pg';
import { ArchiveItem, SourceType } from '../../shared/types';

export const SUPABASE_DIRECT_URL =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres.vzcpagurcgwbjbiodhxi:MiGarfiel2117@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

let pool: Pool | null = null;
let isConnected = false;

export function getPostgresPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: SUPABASE_DIRECT_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 10,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning]:', err.message);
    });
  }
  return pool;
}

export async function initDatabase(): Promise<boolean> {
  try {
    const client = getPostgresPool();
    const testRes = await client.query('SELECT NOW() as now;');
    console.log('[Supabase PostgreSQL Connected]:', testRes.rows[0]);
    isConnected = true;
    return true;
  } catch (err) {
    console.error('[Supabase PostgreSQL Init Error]:', (err as Error).message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function toStringArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((i) => String(i).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((i) => String(i).trim()).filter(Boolean);
        }
      } catch {
        // continue to line split
      }
    }
    const lines = trimmed.split(/\r?\n|•|- |\* /).map((s) => s.trim()).filter(Boolean);
    return lines.length > 0 ? lines : [trimmed];
  }
  return [];
}

export function formatEmbeddingForPostgres(embedding: number[] | string | undefined | null): string | null {
  if (!embedding) return null;
  if (Array.isArray(embedding)) {
    return `[${embedding.join(',')}]`;
  }
  if (typeof embedding === 'string') {
    const trimmed = embedding.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return trimmed;
    }
  }
  return null;
}

export function parseEmbeddingFromPostgres(raw: unknown): number[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw.map(Number);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const inner = trimmed.slice(1, -1).trim();
        if (!inner) return [];
        return inner.split(',').map((v) => Number(v.trim()));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

function mapRowToArchiveItem(row: Record<string, unknown>): ArchiveItem {
  const summary = toStringArray(row.summary);
  const tags = toStringArray(row.tags);
  const keyTakeaways = toStringArray(row.key_takeaways);
  const embedding = parseEmbeddingFromPostgres(row.embedding);

  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    url: String(row.url || ''),
    title: String(row.title || ''),
    rawContent: row.raw_content ? String(row.raw_content) : undefined,
    domain: String(row.domain || ''),
    favicon: row.favicon ? String(row.favicon) : undefined,
    mainIdea: String(row.main_idea || ''),
    summary: summary.length > 0 ? summary : ['Archive preserved successfully.'],
    topicCategory: String(row.topic_category || 'General'),
    tags: tags.length > 0 ? tags : ['Archive'],
    sourceType: (row.source_type as SourceType) || 'OTHER',
    keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : undefined,
    sentimentOrTone: row.sentiment_or_tone ? String(row.sentiment_or_tone) : undefined,
    estimatedReadingMinutes: Number(row.estimated_reading_minutes || 3),
    isFavorite: Boolean(row.is_favorite),
    notes: row.notes ? String(row.notes) : undefined,
    embedding,
    createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : new Date().toISOString(),
  };
}

class TabArchiveDatabase {
  constructor() {
    initDatabase();
  }

  public async getAll(userId?: string): Promise<ArchiveItem[]> {
    const client = getPostgresPool();
    let query = 'SELECT * FROM archives';
    const values: unknown[] = [];

    if (userId && isValidUUID(userId)) {
      query += ' WHERE user_id = $1';
      values.push(userId);
    }

    query += ' ORDER BY created_at DESC;';

    const res = await client.query(query, values);
    return res.rows.map(mapRowToArchiveItem);
  }

  public async getById(id: string, userId?: string): Promise<ArchiveItem | undefined> {
    if (!isValidUUID(id)) return undefined;

    const client = getPostgresPool();
    let query = 'SELECT * FROM archives WHERE id = $1';
    const values: unknown[] = [id];

    if (userId && isValidUUID(userId)) {
      query += ' AND user_id = $2';
      values.push(userId);
    }

    query += ' LIMIT 1;';

    const res = await client.query(query, values);
    if (res.rows.length === 0) return undefined;
    return mapRowToArchiveItem(res.rows[0]);
  }

  public async insert(item: ArchiveItem, userId: string): Promise<ArchiveItem> {
    const client = getPostgresPool();
    
    // Ensure valid UUID
    const finalId = isValidUUID(item.id) ? item.id : crypto.randomUUID();
    const effectiveUserId = isValidUUID(userId) ? userId : (isValidUUID(item.userId || '') ? item.userId! : null);

    if (!effectiveUserId) {
      throw new Error(`Invalid or missing user_id UUID: "${userId}". User must be authenticated.`);
    }

    const summaryArr = toStringArray(item.summary);
    const tagsArr = toStringArray(item.tags);
    const keyTakeawaysArr = toStringArray(item.keyTakeaways);
    const formattedEmbedding = formatEmbeddingForPostgres(item.embedding);

    const query = `
      INSERT INTO archives (
        id, user_id, url, title, raw_content, domain, favicon, main_idea, summary,
        topic_category, tags, source_type, key_takeaways, sentiment_or_tone,
        estimated_reading_minutes, is_favorite, notes, embedding, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        url = EXCLUDED.url,
        title = EXCLUDED.title,
        raw_content = EXCLUDED.raw_content,
        domain = EXCLUDED.domain,
        favicon = EXCLUDED.favicon,
        main_idea = EXCLUDED.main_idea,
        summary = EXCLUDED.summary,
        topic_category = EXCLUDED.topic_category,
        tags = EXCLUDED.tags,
        source_type = EXCLUDED.source_type,
        key_takeaways = EXCLUDED.key_takeaways,
        sentiment_or_tone = EXCLUDED.sentiment_or_tone,
        estimated_reading_minutes = EXCLUDED.estimated_reading_minutes,
        notes = EXCLUDED.notes,
        embedding = EXCLUDED.embedding,
        is_favorite = EXCLUDED.is_favorite,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      finalId,
      effectiveUserId,
      item.url,
      item.title,
      item.rawContent || null,
      item.domain,
      item.favicon || null,
      item.mainIdea,
      summaryArr,
      item.topicCategory,
      tagsArr,
      item.sourceType,
      keyTakeawaysArr,
      item.sentimentOrTone || null,
      item.estimatedReadingMinutes || 3,
      item.isFavorite || false,
      item.notes || null,
      formattedEmbedding,
      item.createdAt || new Date().toISOString(),
      item.updatedAt || new Date().toISOString(),
    ];

    const res = await client.query(query, values);
    return mapRowToArchiveItem(res.rows[0]);
  }

  public async update(id: string, updates: Partial<ArchiveItem>, userId: string): Promise<ArchiveItem | null> {
    const existing = await this.getById(id, userId);
    if (!existing) return null;

    const merged: ArchiveItem = {
      ...existing,
      ...updates,
      id,
      userId: existing.userId || userId,
      updatedAt: new Date().toISOString(),
    };

    return this.insert(merged, userId);
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    if (!isValidUUID(id)) return false;

    const client = getPostgresPool();
    let query = 'DELETE FROM archives WHERE id = $1';
    const values: unknown[] = [id];

    if (userId && isValidUUID(userId)) {
      query += ' AND user_id = $2';
      values.push(userId);
    }

    const res = await client.query(query, values);
    return (res.rowCount ?? 0) > 0;
  }

  public async clearAll(userId: string): Promise<void> {
    if (!isValidUUID(userId)) return;
    const client = getPostgresPool();
    await client.query('DELETE FROM archives WHERE user_id = $1;', [userId]);
  }
}

export const db = new TabArchiveDatabase();
