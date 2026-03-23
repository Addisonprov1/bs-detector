'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PasteTranscript() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAnalyze() {
    if (!text.trim() || text.trim().length < 500) {
      setError('Paste at least 500 characters of transcript text.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          ticker: ticker.toUpperCase() || 'CUSTOM',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }
      const data = await res.json();
      // Store result in sessionStorage for the results page
      sessionStorage.setItem('paste-analysis', JSON.stringify(data));
      router.push('/analysis/paste/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-green)] transition-colors cursor-pointer underline underline-offset-2"
      >
        Or paste your own transcript
      </button>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[var(--color-text-muted)] tracking-widest uppercase">
            Paste Transcript
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Ticker symbol (optional, e.g. TSLA)"
          className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded px-3 py-2 text-sm font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-green)]/40 mb-2"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full earnings call transcript here..."
          rows={8}
          className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded px-3 py-2 text-xs font-mono text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-green)]/40 resize-y"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {text.length.toLocaleString()} characters
          </span>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs text-[var(--color-accent-red)]">{error}</span>
            )}
            <button
              onClick={handleAnalyze}
              disabled={loading || text.trim().length < 500}
              className="px-4 py-1.5 text-xs font-mono rounded border border-[var(--color-accent-green)]/40 text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
