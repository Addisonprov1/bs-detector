'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisHeader } from '@/components/AnalysisHeader';
import { AnnotatedTranscript } from '@/components/AnnotatedTranscript';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import type { AnalysisResult, CategoryKey } from '@/lib/types';

export default function PasteResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [symbol, setSymbol] = useState('CUSTOM');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

  const loadResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/paste-result/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Result not found');
      }
      const data = await res.json();
      setAnalysis(data.analysis);
      setTranscript(data.transcript);
      setSymbol(data.meta?.symbol ?? 'CUSTOM');
      setDate(data.meta?.date ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load analysis');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="win-window mx-auto max-w-sm">
          <div className="win-title-bar">
            <span>Loading...</span>
            <div className="win-buttons"><span /><span /><span /></div>
          </div>
          <div className="win-body p-6 text-center">
            <p className="text-sm text-[#444]">Loading analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="win-window mx-auto max-w-sm">
          <div className="win-title-bar">
            <span>Error</span>
            <div className="win-buttons"><span /><span /><span /></div>
          </div>
          <div className="win-body p-6 text-center">
            <p className="text-sm text-[#444] mb-4">{error || 'No analysis found.'}</p>
            <a
              href="/"
              className="inline-block px-4 py-1.5 text-xs border-2 border-[#dfdfdf] bg-[#c0c0c0] hover:bg-[#d4d4d4] active:border-inset"
              style={{ borderStyle: 'outset' }}
            >
              Back to Home
            </a>
          </div>
        </div>
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
