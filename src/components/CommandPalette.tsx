'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  symbol: string;
  name: string;
  quarter?: number;
  year?: number;
}

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
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
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search any ticker or company name..."
          className="win-input flex-1 text-sm"
        />
        <button
          className="win-button win-button-primary text-xs"
          onClick={() => handleSearch(query)}
          style={{ minWidth: '80px' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {loading && (
        <div className="mt-2 text-xs text-[#808080] flex items-center gap-2">
          <span className="inline-block w-3 h-3 border border-[#808080] border-t-[#000080] rounded-full animate-spin" />
          Searching the web for earnings calls...
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-2 border border-[#808080] bg-white max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={`${r.symbol}-${r.quarter}-${r.year}-${i}`}
              onClick={() => handleSelect(r)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#000080] hover:text-white transition-colors text-sm cursor-pointer ${
                i !== results.length - 1 ? 'border-b border-[#dfdfdf]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs">{r.symbol}</span>
                <span className="text-xs opacity-70">
                  {r.name}
                  {r.quarter && r.year && ` \u00b7 Q${r.quarter} ${r.year}`}
                </span>
              </div>
              {r.quarter && r.year && (
                <span className="text-[10px] opacity-50">Analyze &rarr;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
