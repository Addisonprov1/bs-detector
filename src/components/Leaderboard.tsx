'use client';

import { useRouter } from 'next/navigation';
import { ScoreBadge } from './ui/ScoreBadge';
import type { LeaderboardEntry } from '@/lib/types';

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const router = useRouter();

  if (!entries.length) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-text-muted)] text-sm font-mono">No analyses yet.</p>
        <p className="text-[var(--color-text-muted)] text-xs mt-2">Search for a company above to analyze their earnings call.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase">
          BS Leaderboard
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {entries.length} calls analyzed
        </span>
      </div>

      <div className="border border-[var(--color-border)] rounded-md overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_70px_1fr_80px_60px_70px] gap-0 px-4 py-2.5 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] text-[9px] text-[var(--color-text-muted)] tracking-widest uppercase">
          <span>#</span>
          <span>Ticker</span>
          <span>Company</span>
          <span>Quarter</span>
          <span>Score</span>
          <span>Trend</span>
        </div>

        {/* Rows */}
        {entries.map((entry, i) => (
          <button
            key={`${entry.symbol}-${entry.quarter}-${entry.year}`}
            onClick={() => router.push(`/analysis/${entry.symbol}/${entry.quarter}-${entry.year}`)}
            className="w-full grid grid-cols-[40px_70px_1fr_80px_60px_70px] gap-0 px-4 py-3 border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-surface)] transition-colors text-left cursor-pointer last:border-b-0"
          >
            <span className="font-mono text-sm" style={{ color: i < 3 ? 'var(--color-accent-red)' : 'var(--color-text-muted)' }}>
              {i + 1}
            </span>
            <span className="font-mono font-bold text-sm">{entry.symbol}</span>
            <span className="text-xs text-[var(--color-text-secondary)] truncate pr-2">{entry.company}</span>
            <span className="text-xs text-[var(--color-text-muted)]">Q{entry.quarter} {entry.year}</span>
            <ScoreBadge score={entry.compositeScore} size="sm" />
            <span className="text-[10px] font-mono">
              {entry.trend != null ? (
                <span style={{ color: entry.trend > 0 ? 'var(--color-accent-red)' : 'var(--color-accent-green)' }}>
                  {entry.trend > 0 ? '▲' : '▼'} {entry.trend > 0 ? '+' : ''}{entry.trend}
                </span>
              ) : (
                <span className="text-[var(--color-text-muted)]">—</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
