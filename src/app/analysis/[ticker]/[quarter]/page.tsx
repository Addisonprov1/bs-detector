'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisHeader } from '@/components/AnalysisHeader';
import { AnnotatedTranscript } from '@/components/AnnotatedTranscript';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { LoadingAnalysis } from '@/components/LoadingAnalysis';
import type { AnalysisResult, CategoryKey } from '@/lib/types';

export default function AnalysisPage() {
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();
  const quarterParam = params.quarter as string;
  const [quarter, yearStr] = quarterParam.split('-');
  const q = parseInt(quarter);
  const year = parseInt(yearStr);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [citations, setCitations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

  const runAnalysis = useCallback(async () => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: ticker, quarter: q, year }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setAnalysis(data.analysis);
      setTranscript(data.transcript);
      setDate(data.meta?.date ?? '');
      setCitations(data.meta?.citations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [ticker, q, year]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  if (loading) {
    return <LoadingAnalysis symbol={ticker} quarter={q} year={year} />;
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4">
        <div className="win-window">
          <div className="win-title-bar">
            <span>Error</span>
            <div className="win-buttons"><span /><span /><span /></div>
          </div>
          <div className="win-body p-6 text-center">
            <p className="text-sm text-[#444] mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                runAnalysis();
              }}
              className="win-button win-button-primary text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <AnalysisHeader
        symbol={ticker}
        quarter={q}
        year={year}
        date={date}
        analysis={analysis}
        citations={citations}
      />

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <AnnotatedTranscript
          transcript={transcript}
          excerpts={analysis.flaggedExcerpts}
          onExcerptClick={(cat) => setActiveCategory(cat)}
        />
        <div className="lg:sticky lg:top-4 lg:self-start">
          <AnalysisPanel
            analysis={analysis}
            activeCategory={activeCategory}
          />
        </div>
      </div>
    </div>
  );
}
