'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreBadge } from './ui/ScoreBadge';

interface SearchResult {
  symbol: string;
  name: string;
  quarter?: number;
  year?: number;
  score?: number;
}

const PRESETS = [
  { label: '🔥 Most BS', query: 'most bs' },
  { label: '✅ Straight Shooters', query: 'least bs' },
  { label: '📈 Rising BS', query: 'rising bs' },
  { label: '🏦 FAANG', query: 'AAPL AMZN GOOGL META NFLX' },
];

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/transcripts/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(result: SearchResult) {
    if (result.quarter && result.year) {
      router.push(`/analysis/${result.symbol}/${result.quarter}-${result.year}`);
    } else {
      router.push(`/company/${result.symbol}`);
    }
    setOpen(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <div
        className={`rounded-lg border transition-all ${open ? 'border-[var(--color-accent-green)]/40 shadow-[0_0_20px_rgba(0,255,136,0.08)]' : 'border-[var(--color-border)]'}`}
        style={{ backgroundColor: 'var(--color-bg-input)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className={`text-sm ${open ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-text-muted)]'}`}>❯</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search ticker, company, CEO... or try 'tech sector bs > 70'"
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none font-mono"
          />
          <kbd className="hidden sm:inline-block text-[10px] text-[var(--color-text-muted)] border border-[var(--color-border)] rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
          {loading && (
            <div className="w-4 h-4 border-2 border-[var(--color-accent-green)]/30 border-t-[var(--color-accent-green)] rounded-full animate-spin" />
          )}
        </div>

        {open && results.length > 0 && (
          <div className="border-t border-[var(--color-border)]">
            {results.map((r, i) => (
              <button
                key={`${r.symbol}-${r.quarter}-${r.year}-${i}`}
                onClick={() => handleSelect(r)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--color-accent-green)]/5 transition-colors ${i === 0 ? 'bg-[var(--color-accent-green)]/[0.03]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm">{r.symbol}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {r.name}
                    {r.quarter && r.year && ` · Q${r.quarter} ${r.year}`}
                  </span>
                </div>
                {r.score != null && <ScoreBadge score={r.score} size="sm" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick filter presets */}
      <div className="flex gap-2 justify-center mt-4 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setQuery(p.query);
              handleSearch(p.query);
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="text-xs px-3 py-1.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)] transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
