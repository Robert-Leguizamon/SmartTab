import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://vzcpagurcgwbjbiodhxi.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3BhZ3VyY2d3YmpiaW9kaHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzMzNzYsImV4cCI6MjA1NTc0OTM3Nn0.sample_anon_token_or_env';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
