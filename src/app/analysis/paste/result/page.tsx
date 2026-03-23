'use client';

import { useState, useEffect } from 'react';
import { AnalysisHeader } from '@/components/AnalysisHeader';
import { AnnotatedTranscript } from '@/components/AnnotatedTranscript';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import type { AnalysisResult, CategoryKey } from '@/lib/types';

export default function PasteResultPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [symbol, setSymbol] = useState('CUSTOM');
  const [date, setDate] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('paste-analysis');
    if (stored) {
      const data = JSON.parse(stored);
      setAnalysis(data.analysis);
      setTranscript(data.transcript);
      setSymbol(data.meta?.symbol ?? 'CUSTOM');
      setDate(data.meta?.date ?? '');
    }
  }, []);

  if (!analysis) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">No analysis found. Go back and paste a transcript.</p>
        <a href="/" className="text-xs text-[var(--color-accent-green)] mt-4 inline-block">← Back to home</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <AnalysisHeader
        symbol={symbol}
        quarter={0}
        year={0}
        date={date}
        analysis={analysis}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <AnnotatedTranscript
          transcript={transcript}
          excerpts={analysis.flaggedExcerpts}
          onExcerptClick={(cat) => setActiveCategory(cat)}
        />
        <div className="lg:sticky lg:top-4 lg:self-start">
          <AnalysisPanel analysis={analysis} activeCategory={activeCategory} />
        </div>
      </div>
    </div>
  );
}
