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
    <div className="win-window">
      <div className="win-title-bar">
        <span>Category Breakdown</span>
        <div className="win-buttons"><span /><span /><span /></div>
      </div>
      <div className="win-body p-3">
        <div className="space-y-1.5">
          {CATEGORY_ORDER.map((key) => {
            const cat = analysis.categories[key];
            const meta = CATEGORY_META[key];
            const isExpanded = expandedCategory === key;

            return (
              <div
                key={key}
                className="border border-[#c0c0c0] bg-white"
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-left hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-xs text-[#333] truncate">
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16">
                      <ProgressBar value={cat.score} color={meta.color} />
                    </div>
                    <span
                      className="font-mono font-bold text-xs w-7 text-right"
                      style={{ color: meta.color }}
                    >
                      {cat.score}
                    </span>
                    <span className="text-[#808080] text-[10px]">
                      {isExpanded ? '\u25be' : '\u25b8'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-2.5 pb-2.5 border-t border-[#dfdfdf]">
                    <p className="text-xs text-[#444] mt-2 mb-2.5 leading-relaxed">
                      {cat.explanation}
                    </p>

                    {cat.subIndicators.length > 0 && (
                      <div className="space-y-1">
                        {cat.subIndicators.map((si) => (
                          <div
                            key={si.id}
                            className="flex items-center justify-between text-[10px] px-2 py-1 bg-[#f8f8f8] border border-[#dfdfdf]"
                          >
                            <span className="text-[#666]">
                              <span className="font-mono text-[#333]">{si.id}</span>{' '}
                              {si.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#808080]">
                                {si.count}&times;
                              </span>
                              <span
                                className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                                style={{
                                  color: '#fff',
                                  backgroundColor: si.severity === 'high' ? '#dc2626' : si.severity === 'medium' ? '#ea580c' : '#16a34a',
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
    </div>
  );
}
