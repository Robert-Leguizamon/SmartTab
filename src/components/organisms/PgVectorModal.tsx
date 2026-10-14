import React, { useState } from 'react';
import { Check, Copy, Database, Terminal, X } from 'lucide-react';
import { useArchiveStore } from '../../store/useArchiveStore';
import { Button } from '../atoms/Button';

export const PGVECTOR_SCHEMA_SQL = `-- Smart Tab Archive Schema configured for Supabase PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS archives (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    raw_content TEXT,
    domain TEXT NOT NULL,
    favicon TEXT,
    main_idea TEXT NOT NULL,
    summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    topic_category TEXT NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_type VARCHAR(50) NOT NULL,
    key_takeaways JSONB DEFAULT '[]'::jsonb,
    sentiment_or_tone TEXT,
    estimated_reading_minutes INT DEFAULT 3,
    is_favorite BOOLEAN DEFAULT FALSE,
    notes TEXT,
    embedding JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS archives_created_at_idx ON archives(created_at DESC);
`;

const SAMPLE_COSINE_QUERY_SQL = `-- Natural Language Semantic Search with Cosine Distance
-- Query text converted to 768-dim vector via text-embedding-004
SELECT 
    id,
    title,
    url,
    topic_category,
    source_type,
    main_idea,
    1 - (embedding <=> '[0.012, -0.043, 0.089, ...]'::vector) AS cosine_similarity
FROM archives
WHERE 1 - (embedding <=> '[0.012, -0.043, 0.089, ...]'::vector) > 0.55
ORDER BY embedding <=> '[0.012, -0.043, 0.089, ...]'::vector ASC
LIMIT 10;
`;

export const PgVectorModal: React.FC = () => {
  const { isPgVectorModalOpen, setIsPgVectorModalOpen } = useArchiveStore();
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  if (!isPgVectorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        id="pgvector-modal-container"
        className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">PostgreSQL + pgvector Architecture</h3>
              <p className="text-xs text-neutral-400 font-mono">768-dimensional vector cosine distance index</p>
            </div>
          </div>
          <button
            onClick={() => setIsPgVectorModalOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schema SQL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>DDL Table & Index Definition</span>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(PGVECTOR_SCHEMA_SQL);
                setCopiedSchema(true);
                setTimeout(() => setCopiedSchema(false), 2000);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSchema ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
            {PGVECTOR_SCHEMA_SQL.trim()}
          </pre>
        </div>

        {/* Cosine Query SQL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cosine Similarity Vector Query</span>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(SAMPLE_COSINE_QUERY_SQL);
                setCopiedQuery(true);
                setTimeout(() => setCopiedQuery(false), 2000);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedQuery ? 'Copied' : 'Copy Query'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed">
            {SAMPLE_COSINE_QUERY_SQL.trim()}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="sm" onClick={() => setIsPgVectorModalOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
