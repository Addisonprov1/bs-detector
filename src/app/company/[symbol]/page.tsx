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
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="win-window">
        <div className="win-title-bar">
          <span>{symbol} - Available Earnings Calls</span>
          <div className="win-buttons"><span /><span /><span /></div>
        </div>
        <div className="win-body p-4">
          <a href="/" className="text-xs text-[#000080] hover:underline">
            &larr; Back to search
          </a>
          <h1 className="text-lg font-bold mt-2 mb-1 text-[#1a1a1a]">{symbol}</h1>
          <p className="text-xs text-[#808080] mb-4">Select an earnings call to analyze</p>

          {loading && (
            <div className="text-xs text-[#808080] flex items-center gap-2 py-4">
              <span className="inline-block w-3 h-3 border border-[#808080] border-t-[#000080] rounded-full animate-spin" />
              Searching for earnings calls via Perplexity...
            </div>
          )}

          {error && (
            <p className="text-xs text-[#dc2626] py-2">{error}</p>
          )}

          {!loading && !error && transcripts.length === 0 && (
            <p className="text-xs text-[#808080] py-2">No earnings call transcripts found for {symbol}.</p>
          )}

          {transcripts.length > 0 && (
            <div className="border border-[#808080]">
              {transcripts.map((t, i) => (
                <button
                  key={`${t.quarter}-${t.year}`}
                  onClick={() => router.push(`/analysis/${symbol}/${t.quarter}-${t.year}`)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#000080] hover:text-white transition-colors cursor-pointer text-sm ${
                    i !== transcripts.length - 1 ? 'border-b border-[#c0c0c0]' : ''
                  }`}
                >
                  <span className="font-mono text-xs">Q{t.quarter} {t.year}</span>
                  <span className="text-[10px]">Analyze &rarr;</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
