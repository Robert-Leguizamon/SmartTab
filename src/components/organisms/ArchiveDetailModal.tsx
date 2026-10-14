import React, { useState } from 'react';
import { Check, Clock, Copy, ExternalLink, Heart, Sparkles, Tag, X } from 'lucide-react';
import { ArchiveItem } from '../../../shared/types';
import { updateArchiveApi } from '../../api/archiveApi';
import { useArchiveStore } from '../../store/useArchiveStore';
import { CategoryBadge, ScoreBadge, SourceBadge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

export const ArchiveDetailModal: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  const { selectedArchive, setSelectedArchive } = useArchiveStore();
  const [copied, setCopied] = useState(false);
  const [userNotes, setUserNotes] = useState(selectedArchive?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!selectedArchive) return null;

  const item = selectedArchive;

  const handleCopySummary = () => {
    const text = `# ${item.title}\n\n**Main Idea**: ${item.mainIdea}\n\n**Summary**:\n${item.summary.map((s) => `- ${s}`).join('\n')}\n\nURL: ${item.url}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await updateArchiveApi({ id: item.id, data: { notes: userNotes } });
    setIsSavingNotes(false);
    onUpdate?.();
  };

  const handleToggleFavorite = async () => {
    const updated = await updateArchiveApi({ id: item.id, data: { isFavorite: !item.isFavorite } });
    setSelectedArchive(updated);
    onUpdate?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        id="archive-detail-modal"
        className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge sourceType={item.sourceType} />
              <CategoryBadge category={item.topicCategory} />
              {typeof item.similarityScore === 'number' && item.similarityScore > 0 && (
                <ScoreBadge score={item.similarityScore} />
              )}
            </div>
            <h2 className="text-lg font-bold text-neutral-100 leading-snug">{item.title}</h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span>{item.domain}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Visit URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                item.isFavorite
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
              }`}
              title="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => setSelectedArchive(null)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gemini Main Idea */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini AI Main Idea</span>
          </div>
          <p className="text-sm text-neutral-100 leading-relaxed font-sans">{item.mainIdea}</p>
        </div>

        {/* Structured Summary Points */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Key Insights & Executive Summary
          </h4>
          <div className="space-y-2">
            {item.summary.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-850 border border-neutral-800 text-xs text-neutral-200 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-mono text-[11px] shrink-0">
                  {i + 1}
                </span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaways & Tone */}
        {item.keyTakeaways && item.keyTakeaways.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Actionable Takeaways
            </h4>
            <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1 pl-1">
              {item.keyTakeaways.map((takeaway, i) => (
                <li key={i}>{takeaway}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800 text-xs text-neutral-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-neutral-500 mr-1" />
            {item.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs">
                #{t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            {item.estimatedReadingMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.estimatedReadingMinutes} min read</span>
              </span>
            )}
            <span>Vector: 768-dim</span>
          </div>
        </div>

        {/* User Notes */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-medium text-neutral-300">
            Personal Notes & Annotations
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Add your own commentary or project reference..."
              className="flex-1 rounded-xl bg-neutral-900 border border-neutral-750 px-3 py-2 text-xs text-neutral-100 focus:ring-2 focus:ring-indigo-500/50"
            />
            <Button size="sm" variant="secondary" onClick={handleSaveNotes} isLoading={isSavingNotes}>
              Save Note
            </Button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopySummary}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
          </Button>

          <Button size="sm" variant="primary" onClick={() => setSelectedArchive(null)}>
            Close Reader
          </Button>
        </div>
      </div>
    </div>
  );
};
