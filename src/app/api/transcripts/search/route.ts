import { NextRequest, NextResponse } from 'next/server';
import { searchCompanies } from '@/lib/fmp';
import { parseSearchQuery } from '@/lib/search-parser';

// Popular tickers users are likely to search for
const POPULAR_TICKERS: Record<string, string> = {
  AAPL: 'Apple Inc.',
  TSLA: 'Tesla Inc.',
  MSFT: 'Microsoft Corp.',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com Inc.',
  META: 'Meta Platforms Inc.',
  NVDA: 'NVIDIA Corp.',
  NFLX: 'Netflix Inc.',
  CRM: 'Salesforce Inc.',
  JPM: 'JPMorgan Chase & Co.',
  BAC: 'Bank of America Corp.',
  WMT: 'Walmart Inc.',
  DIS: 'The Walt Disney Co.',
  INTC: 'Intel Corp.',
  AMD: 'Advanced Micro Devices',
  UBER: 'Uber Technologies',
  SNAP: 'Snap Inc.',
  SQ: 'Block Inc.',
  COIN: 'Coinbase Global',
  PLTR: 'Palantir Technologies',
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const filters = parseSearchQuery(q);
    const results: { symbol: string; name: string; quarter?: number; year?: number }[] = [];

    // If we detect uppercase ticker-like input, check our popular list first
    if (filters.symbols.length > 0) {
      for (const sym of filters.symbols) {
        const upper = sym.toUpperCase();
        if (POPULAR_TICKERS[upper]) {
          results.push({ symbol: upper, name: POPULAR_TICKERS[upper] });
        } else {
          // Still return it as a result even if not in our list
          results.push({ symbol: upper, name: upper });
        }
      }
    }

    // Also do a name search to catch partial matches
    const searchText = filters.freeText || q;
    if (searchText.length >= 2) {
      const companies = await searchCompanies(searchText);
      for (const company of companies.slice(0, 10)) {
        // Avoid duplicates
        if (!results.some(r => r.symbol === company.symbol)) {
          results.push({ symbol: company.symbol, name: company.name });
        }
      }
    }

    // If no results from API, try matching against our popular list by name
    if (results.length === 0) {
      const lower = q.toLowerCase();
      for (const [sym, name] of Object.entries(POPULAR_TICKERS)) {
        if (sym.toLowerCase().includes(lower) || name.toLowerCase().includes(lower)) {
          results.push({ symbol: sym, name });
        }
      }
    }

    return NextResponse.json({ results: results.slice(0, 15) });
  } catch (err) {
    console.error('[search] error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
