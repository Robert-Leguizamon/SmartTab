import React, { useState } from 'react';
import { Cpu, Link, Sparkles, X } from 'lucide-react';
import { SourceType } from '../../../shared/types';
import { extractUrlApi, ingestArchiveApi } from '../../api/archiveApi';
import { useArchiveStore } from '../../store/useArchiveStore';
import { Button } from '../atoms/Button';
import { Input, Textarea } from '../atoms/Input';

export const IngestionModal: React.FC<{ onArchiveCreated?: () => void }> = ({ onArchiveCreated }) => {
  const { isIngestModalOpen, setIsIngestModalOpen } = useArchiveStore();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [sourceType, setSourceType] = useState<SourceType | ''>('');
  const [notes, setNotes] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  if (!isIngestModalOpen) return null;

  const handleUrlBlur = async () => {
    if (!url.trim().startsWith('http')) return;
    setIsExtracting(true);
    setStatusMessage('Extracting URL metadata & site preview...');
    try {
      const meta = await extractUrlApi(url.trim());
      if (meta.title && !title) setTitle(meta.title);
      if (meta.excerpt && !rawContent) setRawContent(meta.excerpt);
    } catch {
      // ignore
    } finally {
      setIsExtracting(false);
      setStatusMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid URL');
      return;
    }
    setError('');
    setIsIngesting(true);
    setStatusMessage('Running Gemini structured analysis & computing 768-dim vector embedding...');

    try {
      await ingestArchiveApi({
        url: url.trim(),
        title: title.trim() || undefined,
        rawContent: rawContent.trim() || undefined,
        sourceType: (sourceType as SourceType) || undefined,
        notes: notes.trim() || undefined,
      });

      setIsIngestModalOpen(false);
      setUrl('');
      setTitle('');
      setRawContent('');
      setSourceType('');
      setNotes('');
      onArchiveCreated?.();
    } catch (err) {
      setError((err as Error).message || 'Failed to archive link');
    } finally {
      setIsIngesting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        id="ingest-modal-container"
        className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-700/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-100">Archive & Analyze Tab</h2>
              <p className="text-xs text-neutral-400 font-mono">POST /api/v1/archive</p>
            </div>
          </div>
          <button
            onClick={() => setIsIngestModalOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="input-archive-url"
            label="Target URL *"
            placeholder="https://..."
            leftIcon={<Link className="w-4 h-4" />}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="input-archive-title"
              label="Title (Optional, auto-extracted)"
              placeholder="Custom title or auto-detected"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Source Type (Optional)
              </label>
              <select
                id="select-archive-sourcetype"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-750 px-3.5 py-2.5 text-sm text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                <option value="">Auto-Detect by Gemini</option>
                <option value="AI_CHAT">AI Chat (ChatGPT/Claude/Gemini)</option>
                <option value="YOUTUBE_VIDEO">YouTube Video</option>
                <option value="ARTICLE">Article / Blog Post</option>
                <option value="OTHER">Other Web Resource</option>
              </select>
            </div>
          </div>

          <Textarea
            id="textarea-archive-content"
            label="Raw Content / Transcript / Text Excerpt (Optional)"
            placeholder="Paste text excerpt or transcript if available for deeper AI synthesis..."
            rows={3}
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
          />

          <Textarea
            id="textarea-archive-notes"
            label="Personal Notes (Optional)"
            placeholder="Add context on why you're saving this tab..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {statusMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-950/50 border border-indigo-800/60 text-indigo-300 text-xs font-mono">
              <Cpu className="w-4 h-4 animate-spin shrink-0 text-indigo-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsIngestModalOpen(false)}
              disabled={isIngesting || isExtracting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isIngesting}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Analyze & Save to Supabase
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
