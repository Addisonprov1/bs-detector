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

    const matches: { start: number; end: number; excerpt: FlaggedExcerpt }[] = [];

    for (const excerpt of excerpts) {
      let searchFrom = 0;
      while (true) {
        const idx = transcript.indexOf(excerpt.text, searchFrom);
        if (idx === -1) break;
        matches.push({ start: idx, end: idx + excerpt.text.length, excerpt });
        searchFrom = idx + excerpt.text.length;
      }
    }

    matches.sort((a, b) => a.start - b.start);

    const filtered: typeof matches = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        filtered.push(m);
        lastEnd = m.end;
      }
    }

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
      <div className="win-window">
        <div className="win-title-bar">
          <span>Transcript</span>
          <div className="win-buttons"><span /><span /><span /></div>
        </div>
        <div className="win-body p-4 text-sm leading-relaxed max-h-[70vh] overflow-y-auto font-mono text-[#333]">
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
      </div>

      {/* Tooltip as Win98 window */}
      {hoveredExcerpt && (
        <div
          className="fixed z-50 max-w-xs win-window pointer-events-none"
          style={{
            left: Math.min(tooltipPos.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 300),
            top: tooltipPos.y,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="win-title-bar" style={{ padding: '2px 4px', fontSize: '10px' }}>
            <span>{hoveredExcerpt.category}</span>
          </div>
          <div className="win-body p-2">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-bold tracking-wider uppercase"
                style={{ color: CATEGORY_META[hoveredExcerpt.category as CategoryKey]?.color }}
              >
                {CATEGORY_META[hoveredExcerpt.category as CategoryKey]?.label}
              </span>
            </div>
            <p className="text-[10px] text-[#444] leading-snug">
              {hoveredExcerpt.subIndicatorName}: {hoveredExcerpt.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 flex-wrap mt-3 px-1">
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 text-[10px]">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: meta.color }}
            />
            <span style={{ color: 'rgba(255,255,255,0.7)', textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>
              {meta.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
