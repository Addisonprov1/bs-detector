'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { POPULAR_POLITICIANS } from '@/lib/perplexity';

interface TranscriptEntry {
  speaker: string;
  title: string;
  date: string;
  type: string;
  slug: string;
}

export default function PoliticianPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const politician = POPULAR_POLITICIANS.find((p) => p.slug === slug);
  const displayName = politician?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranscripts = useCallback(async () => {
    try {
      const res = await fetch(`/api/political/search?q=${encodeURIComponent(displayName)}`);
      if (!res.ok) throw new Error('Failed to load transcripts');
      const data = await res.json();
      // Filter out "person" type entries (those are just local matches)
      const events = (data.results ?? []).filter((r: TranscriptEntry) => r.type !== 'person');
      setTranscripts(events);
    } catch {
      setError('Could not load speeches for this person.');
    } finally {
      setLoading(false);
    }
  }, [displayName]);

  useEffect(() => {
    loadTranscripts();
  }, [loadTranscripts]);

  const typeLabels: Record<string, string> = {
    press_conference: 'Press Conference',
    hearing: 'Hearing',
    speech: 'Speech',
    debate: 'Debate',
    interview: 'Interview',
    briefing: 'Briefing',
    address: 'Address',
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="win-window">
        <div className="win-title-bar">
          <span>{displayName} - Speeches & Statements</span>
          <div className="win-buttons"><span /><span /><span /></div>
        </div>
        <div className="win-body p-4">
          <a href="/" className="text-xs text-[#000080] hover:underline">
            &larr; Back to search
          </a>
          <h1 className="text-lg font-bold mt-2 mb-0.5 text-[#1a1a1a]">{displayName}</h1>
          {politician && <p className="text-xs text-[#808080] mb-4">{politician.role}</p>}

          {loading && (
            <div className="text-xs text-[#808080] flex items-center gap-2 py-4">
              <span className="inline-block w-3 h-3 border border-[#808080] border-t-[#000080] rounded-full animate-spin" />
              Searching for speeches via Perplexity...
            </div>
          )}

          {error && <p className="text-xs text-[#dc2626] py-2">{error}</p>}

          {!loading && !error && transcripts.length === 0 && (
            <p className="text-xs text-[#808080] py-2">No transcripts found. Try searching for a specific speech or event.</p>
          )}

          {transcripts.length > 0 && (
            <div className="border border-[#808080]">
              {transcripts.map((t, i) => (
                <button
                  key={`${t.slug}-${i}`}
                  onClick={() => {
                    const params = new URLSearchParams({
                      speaker: t.speaker,
                      title: t.title,
                      date: t.date,
                    });
                    router.push(`/analysis/political/${slug}/${t.slug}?${params.toString()}`);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#000080] hover:text-white transition-colors cursor-pointer text-xs ${
                    i !== transcripts.length - 1 ? 'border-b border-[#c0c0c0]' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{t.title}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">
                      {t.date && `${t.date} \u00b7 `}{typeLabels[t.type] || t.type}
                    </div>
                  </div>
                  <span className="text-[10px] ml-2 shrink-0">Analyze &rarr;</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
