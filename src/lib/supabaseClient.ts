import { createClient, Session, User } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string> }).env || {} : {};

export const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL ||
  'https://vzcpagurcgwbjbiodhxi.supabase.co';

export const SUPABASE_ANON_KEY =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3BhZ3VyY2d3YmpiaW9kaHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzMzNzYsImV4cCI6MjA1NTc0OTM3Nn0.sample_anon_token_or_env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) {
    cachedToken = data.session.access_token;
    return cachedToken;
  }
  return cachedToken;
}

export function setCachedToken(token: string | null): void {
  cachedToken = token;
}

export type { User, Session };
