import { useQuery } from '@tanstack/react-query';
import {
  ArchiveItem,
  ArchiveStats,
  ChatMessage,
  ChatRequest,
  IngestArchiveRequest,
  SearchQueryRequest,
  SearchResponse,
} from '../../shared/types';
import { supabase } from '../lib/supabaseClient';

const API_BASE = '/api/v1/archive';

async function getAuthHeaders(includeJson = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Could not read session token:', err);
  }
  return headers;
}

export async function fetchArchives(category?: string, sourceType?: string, favorite?: boolean): Promise<ArchiveItem[]> {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (sourceType && sourceType !== 'ALL') params.append('sourceType', sourceType);
  if (favorite) params.append('favorite', 'true');

  const headers = await getAuthHeaders(false);
  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers,
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch archives');
  }
  const data = await res.json();
  return data.items;
}

export async function searchArchivesApi(request: SearchQueryRequest): Promise<SearchResponse> {
  const headers = await getAuthHeaders(true);
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to perform search');
  return res.json();
}

export async function ingestArchiveApi(request: IngestArchiveRequest): Promise<ArchiveItem> {
  const headers = await getAuthHeaders(true);
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to archive and analyze URL');
  }
  return res.json();
}

export async function sendChatMessageApi(request: ChatRequest): Promise<ChatMessage> {
  const headers = await getAuthHeaders(true);
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to get chat response');
  return res.json();
}

export async function fetchStatsApi(): Promise<ArchiveStats> {
  const headers = await getAuthHeaders(false);
  const res = await fetch(`${API_BASE}/stats`, {
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function updateArchiveApi(params: { id: string; data: Partial<ArchiveItem> }): Promise<ArchiveItem> {
  const headers = await getAuthHeaders(true);
  const res = await fetch(`${API_BASE}/${params.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(params.data),
  });
  if (!res.ok) throw new Error('Failed to update archive');
  return res.json();
}

export async function deleteArchiveApi(id: string): Promise<{ success: boolean; id: string }> {
  const headers = await getAuthHeaders(false);
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete archive');
  return res.json();
}

export async function extractUrlApi(url: string): Promise<{ title?: string; domain: string; favicon?: string; excerpt?: string }> {
  const headers = await getAuthHeaders(true);
  const res = await fetch(`${API_BASE}/extract-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Failed to extract URL');
  return res.json();
}

export async function clearAllArchivesApi(): Promise<void> {
  const headers = await getAuthHeaders(false);
  const res = await fetch(`${API_BASE}/clear-all`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to clear archives');
}

export function useArchivesQuery(category?: string, sourceType?: string, favorite?: boolean, enabled = true) {
  return useQuery({
    queryKey: ['archives', category, sourceType, favorite],
    queryFn: () => fetchArchives(category, sourceType, favorite),
    enabled,
  });
}

export function useArchiveStatsQuery(enabled = true) {
  return useQuery({
    queryKey: ['archiveStats'],
    queryFn: fetchStatsApi,
    refetchInterval: 10000,
    enabled,
  });
}
