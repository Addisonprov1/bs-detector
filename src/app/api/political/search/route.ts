import { NextRequest, NextResponse } from 'next/server';
import { searchPoliticiansLocal, searchPoliticalTranscripts } from '@/lib/perplexity';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Phase 1: Instant local matches
    const localMatches = searchPoliticiansLocal(q);
    const results: { speaker: string; title: string; date: string; type: string; slug: string }[] = [];

    for (const p of localMatches.slice(0, 5)) {
      results.push({
        speaker: p.name,
        title: p.role,
        date: '',
        type: 'person',
        slug: p.slug,
      });
    }

    // Phase 2: Sonar search for actual transcripts
    try {
      const sonarResults = await searchPoliticalTranscripts(q);
      for (const sr of sonarResults) {
        const exists = results.some((r) => r.slug === sr.slug);
        if (!exists) {
          results.push({
            speaker: sr.speaker,
            title: sr.title,
            date: sr.date,
            type: sr.type,
            slug: sr.slug,
          });
        }
      }
    } catch {
      console.error('[political search] Sonar failed, using local results only');
    }

    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (err) {
    console.error('[political search] error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
