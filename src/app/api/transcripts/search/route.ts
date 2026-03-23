import { NextRequest, NextResponse } from 'next/server';
import { searchCompanies, listAvailableTranscripts } from '@/lib/fmp';
import { parseSearchQuery } from '@/lib/search-parser';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const filters = parseSearchQuery(q);

    // If we have specific ticker symbols, look up their available transcripts
    if (filters.symbols.length > 0) {
      const results: { symbol: string; name: string; quarter?: number; year?: number }[] = [];
      const lookups = filters.symbols.slice(0, 5).map(async (symbol) => {
        const transcripts = await listAvailableTranscripts(symbol);
        for (const t of transcripts.slice(0, 4)) {
          if (filters.quarter && t.quarter !== filters.quarter) continue;
          if (filters.year && t.year !== filters.year) continue;
          results.push({
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(),
            quarter: t.quarter,
            year: t.year,
          });
        }
        // If no transcripts found, still return the symbol as a result
        if (transcripts.length === 0) {
          results.push({ symbol: symbol.toUpperCase(), name: symbol.toUpperCase() });
        }
      });
      await Promise.all(lookups);
      return NextResponse.json({ results });
    }

    // Otherwise, search companies by name — return results immediately without
    // looking up transcripts for each (that was causing the slowness/failures)
    const searchText = filters.freeText || q;
    const companies = await searchCompanies(searchText);

    const results = companies.slice(0, 10).map((company) => ({
      symbol: company.symbol,
      name: company.name,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[search] error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
