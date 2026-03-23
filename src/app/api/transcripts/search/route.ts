import { NextRequest, NextResponse } from 'next/server';
import { searchCompaniesLocal, getEvents, getCompanyExchange } from '@/lib/fmp';
import { parseSearchQuery } from '@/lib/search-parser';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const filters = parseSearchQuery(q);
    const searchText = filters.symbols.length > 0 ? filters.symbols[0] : (filters.freeText || q);
    const companies = searchCompaniesLocal(searchText);

    const results: { symbol: string; name: string; quarter?: number; year?: number }[] = [];

    // Try to fetch events for each company, but don't fail if API errors
    const lookups = companies.slice(0, 8).map(async (company) => {
      try {
        const events = await getEvents(company.symbol, company.exchange);
        if (events.length > 0) {
          for (const event of events.slice(0, 3)) {
            if (filters.quarter && event.quarter !== filters.quarter) continue;
            if (filters.year && event.year !== filters.year) continue;
            results.push({
              symbol: company.symbol,
              name: company.name,
              quarter: event.quarter,
              year: event.year,
            });
          }
        } else {
          // No events found, still show company so user can navigate
          results.push({ symbol: company.symbol, name: company.name });
        }
      } catch {
        // API failed for this company, still show it as clickable
        results.push({ symbol: company.symbol, name: company.name });
      }
    });

    await Promise.all(lookups);

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
