'use client';

import { useState } from 'react';
import { ProgressBar } from './ui/ProgressBar';
import type { AnalysisResult, CategoryKey } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';

interface Props {
  analysis: AnalysisResult;
  activeCategory?: CategoryKey | null;
}

const CATEGORY_ORDER: CategoryKey[] = [
  'evasion',
  'hedging',
  'distancing',
  'persuasion',
  'cognitiveLoad',
  'emotionalLeakage',
  'strategicOmission',
];

export function AnalysisPanel({ analysis, activeCategory }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<CategoryKey | null>(activeCategory ?? null);

  return (
    <div>
      <div className="text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
        Category Breakdown
      </div>
      <div className="space-y-2">
        {CATEGORY_ORDER.map((key) => {
          const cat = analysis.categories[key];
          const meta = CATEGORY_META[key];
          const isExpanded = expandedCategory === key;

          return (
            <div
              key={key}
              className={`bg-[var(--color-bg-surface)] border rounded-md overflow-hidden transition-all ${
                isExpanded ? 'border-[var(--color-text-muted)]/30' : 'border-[var(--color-border)]'
              }`}
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[var(--color-bg-primary)]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs text-[var(--color-text-secondary)] truncate">
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-20">
                    <ProgressBar value={cat.score} color={meta.color} />
                  </div>
                  <span
                    className="font-mono font-bold text-sm w-8 text-right"
                    style={{ color: meta.color }}
                  >
                    {cat.score}
                  </span>
                  <span className="text-[var(--color-text-muted)] text-xs">
                    {isExpanded ? '▾' : '▸'}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2 mb-3 leading-relaxed">
                    {cat.explanation}
                  </p>

                  {cat.subIndicators.length > 0 && (
                    <div className="space-y-1.5">
                      {cat.subIndicators.map((si) => (
                        <div
                          key={si.id}
                          className="flex items-center justify-between text-[10px] px-2 py-1 rounded bg-[var(--color-bg-primary)]/50"
                        >
                          <span className="text-[var(--color-text-muted)]">
                            <span className="font-mono text-[var(--color-text-secondary)]">{si.id}</span>{' '}
                            {si.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-text-muted)]">
                              {si.count}×
                            </span>
                            <span
                              className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                              style={{
                                color: si.severity === 'high' ? '#ff4444' : si.severity === 'medium' ? '#ff8800' : '#00ff88',
                                backgroundColor: si.severity === 'high' ? 'rgba(255,68,68,0.1)' : si.severity === 'medium' ? 'rgba(255,136,0,0.1)' : 'rgba(0,255,136,0.1)',
                              }}
                            >
                              {si.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
