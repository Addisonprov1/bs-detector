import { NextRequest, NextResponse } from 'next/server';
import { searchCompanies, listTranscripts } from '@/lib/fmp';
import { parseSearchQuery } from '@/lib/search-parser';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const filters = parseSearchQuery(q);

  // If we have specific symbols, search for their transcripts
  if (filters.symbols.length > 0) {
    const results = [];
    for (const symbol of filters.symbols.slice(0, 5)) {
      const transcripts = await listTranscripts(symbol);
      for (const t of transcripts.slice(0, 4)) {
        if (filters.quarter && t.quarter !== filters.quarter) continue;
        if (filters.year && t.year !== filters.year) continue;
        results.push({
          symbol: t.symbol,
          name: t.symbol,
          quarter: t.quarter,
          year: t.year,
        });
      }
    }
    return NextResponse.json({ results });
  }

  // Otherwise, search companies by name
  const searchText = filters.freeText || q;
  const companies = await searchCompanies(searchText);
  const results = [];

  for (const company of companies.slice(0, 8)) {
    const transcripts = await listTranscripts(company.symbol);
    if (transcripts.length > 0) {
      const t = transcripts[0]; // Most recent
      results.push({
        symbol: company.symbol,
        name: company.name,
        quarter: t.quarter,
        year: t.year,
      });
    } else {
      results.push({
        symbol: company.symbol,
        name: company.name,
      });
    }
  }

  return NextResponse.json({ results });
}
