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
      router.push(`/analysis/paste/${data.id}`);
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
        className="text-xs underline cursor-pointer"
        style={{ color: 'rgba(255,255,255,0.7)', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}
      >
        Or paste your own transcript
      </button>
    );
  }

  return (
    <div className="win-window w-full max-w-2xl mx-auto mt-4">
      <div className="win-title-bar">
        <span>Paste Transcript</span>
        <div className="win-buttons">
          <span />
          <span />
          <span onClick={() => setOpen(false)} style={{ cursor: 'pointer' }} />
        </div>
      </div>
      <div className="win-body p-3">
        <div className="flex gap-2 mb-2">
          <label className="text-xs text-[#444] self-center min-w-[50px]">Ticker:</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g. TSLA (optional)"
            className="win-input flex-1 text-xs"
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full earnings call transcript here..."
          rows={8}
          className="win-input w-full text-xs font-mono resize-y"
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-[#808080]">
            {text.length.toLocaleString()} characters {text.length < 500 && text.length > 0 ? '(min 500)' : ''}
          </span>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-[11px] text-[#dc2626]">{error}</span>
            )}
            <button
              onClick={() => setOpen(false)}
              className="win-button text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading || text.trim().length < 500}
              className="win-button win-button-primary text-xs"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
