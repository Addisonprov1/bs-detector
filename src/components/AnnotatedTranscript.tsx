'use client';

import { useState, useMemo } from 'react';
import type { FlaggedExcerpt, CategoryKey } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';

interface Props {
  transcript: string;
  excerpts: FlaggedExcerpt[];
  onExcerptClick?: (category: CategoryKey) => void;
}

interface Segment {
  text: string;
  excerpt?: FlaggedExcerpt;
}

export function AnnotatedTranscript({ transcript, excerpts, onExcerptClick }: Props) {
  const [hoveredExcerpt, setHoveredExcerpt] = useState<FlaggedExcerpt | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const segments = useMemo(() => {
    if (!excerpts.length) return [{ text: transcript }];

    // Find all excerpt positions in the transcript
    const matches: { start: number; end: number; excerpt: FlaggedExcerpt }[] = [];

    for (const excerpt of excerpts) {
      let searchFrom = 0;
      // Find all occurrences
      while (true) {
        const idx = transcript.indexOf(excerpt.text, searchFrom);
        if (idx === -1) break;
        matches.push({ start: idx, end: idx + excerpt.text.length, excerpt });
        searchFrom = idx + excerpt.text.length;
      }
    }

    // Sort by position
    matches.sort((a, b) => a.start - b.start);

    // Remove overlaps (keep first match)
    const filtered: typeof matches = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        filtered.push(m);
        lastEnd = m.end;
      }
    }

    // Build segments
    const result: Segment[] = [];
    let pos = 0;
    for (const m of filtered) {
      if (m.start > pos) {
        result.push({ text: transcript.slice(pos, m.start) });
      }
      result.push({ text: transcript.slice(m.start, m.end), excerpt: m.excerpt });
      pos = m.end;
    }
    if (pos < transcript.length) {
      result.push({ text: transcript.slice(pos) });
    }

    return result;
  }, [transcript, excerpts]);

  return (
    <div className="relative">
      <div className="text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
        Transcript
      </div>
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-4 text-sm leading-relaxed max-h-[70vh] overflow-y-auto font-mono text-[var(--color-text-secondary)]">
        {segments.map((seg, i) => {
          if (!seg.excerpt) {
            return <span key={i}>{seg.text}</span>;
          }

          const cat = seg.excerpt.category as CategoryKey;
          const meta = CATEGORY_META[cat];

          return (
            <mark
              key={i}
              className={`highlight-${cat} cursor-pointer rounded-sm px-0.5 relative`}
              onMouseEnter={(e) => {
                setHoveredExcerpt(seg.excerpt!);
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setTooltipPos({ x: rect.left, y: rect.top - 8 });
              }}
              onMouseLeave={() => setHoveredExcerpt(null)}
              onClick={() => onExcerptClick?.(cat)}
              style={{ color: meta?.color }}
            >
              {seg.text}
            </mark>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredExcerpt && (
        <div
          className="fixed z-50 max-w-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 shadow-xl pointer-events-none"
          style={{
            left: Math.min(tooltipPos.x, window.innerWidth - 300),
            top: tooltipPos.y,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold tracking-wider uppercase"
              style={{ color: CATEGORY_META[hoveredExcerpt.category as CategoryKey]?.color }}
            >
              {hoveredExcerpt.category}
            </span>
            <span className="text-[9px] text-[var(--color-text-muted)]">·</span>
            <span className="text-[9px] text-[var(--color-text-muted)]">
              {hoveredExcerpt.subIndicatorName}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-snug">
            {hoveredExcerpt.explanation}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 flex-wrap mt-3">
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 text-[9px]">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            <span className="text-[var(--color-text-muted)]">{meta.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
