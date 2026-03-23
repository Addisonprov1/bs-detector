'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TranscriptEntry {
  quarter: number;
  year: number;
}

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string).toUpperCase();
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranscripts = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${symbol}/transcripts`);
      if (!res.ok) throw new Error('Failed to load transcripts');
      const data = await res.json();
      setTranscripts(data.transcripts ?? []);
    } catch {
      setError('Could not load transcripts for this company.');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadTranscripts();
  }, [loadTranscripts]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <a href="/" className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
        ← Back to search
      </a>
      <h1 className="text-2xl font-bold mt-2 mb-1">{symbol}</h1>
      <p className="text-xs text-[var(--color-text-muted)] mb-8">Select an earnings call to analyze</p>

      {loading && (
        <div className="text-sm text-[var(--color-text-muted)] font-mono cursor-blink">
          Loading available transcripts...
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-accent-red)]">{error}</p>
      )}

      {!loading && !error && transcripts.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">No earnings call transcripts available for {symbol}.</p>
      )}

      {transcripts.length > 0 && (
        <div className="border border-[var(--color-border)] rounded-md overflow-hidden">
          {transcripts.map((t) => (
            <button
              key={`${t.quarter}-${t.year}`}
              onClick={() => router.push(`/analysis/${symbol}/${t.quarter}-${t.year}`)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-surface)] transition-colors text-left cursor-pointer last:border-b-0"
            >
              <span className="font-mono text-sm">Q{t.quarter} {t.year}</span>
              <span className="text-xs text-[var(--color-accent-green)]">Analyze →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
