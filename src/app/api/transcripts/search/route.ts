import { NextRequest, NextResponse } from 'next/server';
import { searchCompaniesLocal, searchEarningsCalls } from '@/lib/perplexity';
import { parseSearchQuery } from '@/lib/search-parser';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const filters = parseSearchQuery(q);
    const searchText = filters.symbols.length > 0 ? filters.symbols[0] : (filters.freeText || q);

    // Phase 1: Instant local matches
    const localCompanies = searchCompaniesLocal(searchText);
    const results: { symbol: string; name: string; quarter?: number; year?: number }[] = [];

    // Add local matches immediately
    for (const company of localCompanies.slice(0, 5)) {
      results.push({ symbol: company.symbol, name: company.name });
    }

    // Phase 2: Sonar search for earnings call events
    try {
      const sonarResults = await searchEarningsCalls(searchText);
      for (const sr of sonarResults) {
        if (filters.quarter && sr.quarter !== filters.quarter) continue;
        if (filters.year && sr.year !== filters.year) continue;

        // Avoid duplicates
        const exists = results.some(
          (r) => r.symbol === sr.symbol && r.quarter === sr.quarter && r.year === sr.year
        );
        if (!exists) {
          results.push({
            symbol: sr.symbol,
            name: sr.companyName,
            quarter: sr.quarter,
            year: sr.year,
          });
        }
      }
    } catch {
      // Sonar failed, still return local results
      console.error('[search] Sonar search failed, using local results only');
    }

    // Sort: specific quarter results first, then by year desc
    results.sort((a, b) => {
      if (a.year && b.year) return b.year - a.year || (b.quarter ?? 0) - (a.quarter ?? 0);
      if (a.year) return -1;
      return 1;
    });

    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (err) {
    console.error('[search] error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
