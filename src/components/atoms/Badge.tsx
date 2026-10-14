import React from 'react';
import { Bot, FileText, Globe, Sparkles, Youtube } from 'lucide-react';
import { SourceType } from '../../../shared/types';

interface SourceBadgeProps {
  sourceType: SourceType;
  size?: 'sm' | 'md';
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ sourceType, size = 'md' }) => {
  const configs: Record<
    SourceType,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    AI_CHAT: {
      label: 'AI Chat',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-700/50',
      icon: <Bot className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    YOUTUBE_VIDEO: {
      label: 'YouTube',
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-700/50',
      icon: <Youtube className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    ARTICLE: {
      label: 'Article',
      bg: 'bg-sky-950/60',
      text: 'text-sky-300',
      border: 'border-sky-700/50',
      icon: <FileText className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    OTHER: {
      label: 'Web Link',
      bg: 'bg-neutral-800/80',
      text: 'text-neutral-300',
      border: 'border-neutral-700',
      icon: <Globe className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
  };

  const cfg = configs[sourceType] || configs.OTHER;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      id={`source-badge-${sourceType.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border} ${padding} whitespace-nowrap shadow-xs`}
    >
      {cfg.icon}
      <span>{cfg.label}</span>
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  return (
    <span
      id={`category-badge-${category.replace(/\s+/g, '-').toLowerCase()}`}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-700/40 whitespace-nowrap"
    >
      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
      {category}
    </span>
  );
};

export const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const pct = Math.round(score * 100);
  const colorClass =
    pct >= 75
      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
      : pct >= 50
      ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
      : 'bg-neutral-800 text-neutral-400 border-neutral-700';

  return (
    <span
      id={`score-badge-${pct}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${colorClass} whitespace-nowrap`}
      title="Semantic Cosine Match Score"
    >
      <span>{pct}% match</span>
    </span>
  );
};
