import type { TranscriptMeta } from './types';

// Using EarningsCall.biz API (free tier includes AAPL, MSFT; full access with API key)
const EC_BASE = 'https://v2.api.earningscall.biz';
const EC_API_KEY = process.env.EARNINGSCALL_API_KEY || 'demo';

interface ECEvent {
  year: number;
  quarter: number;
  conference_date: string;
}

interface ECSymbol {
  symbol: string;
  name: string;
  exchange: string;
}

interface ECTranscriptResponse {
  event: ECEvent;
  text: string;
}

export async function getSymbolsList(): Promise<ECSymbol[]> {
  try {
    const url = `${EC_BASE}/symbols?apikey=${EC_API_KEY}`;
    console.log('[EC] getSymbolsList');
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[EC] getSymbolsList error:', err);
    return [];
  }
}

export async function getEvents(symbol: string, exchange: string = 'NASDAQ'): Promise<ECEvent[]> {
  try {
    const url = `${EC_BASE}/events?apikey=${EC_API_KEY}&symbol=${symbol.toUpperCase()}&exchange=${exchange}`;
    console.log('[EC] getEvents:', symbol);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      // Try NYSE if NASDAQ fails
      if (exchange === 'NASDAQ') {
        return getEvents(symbol, 'NYSE');
      }
      return [];
    }
    const data = await res.json();
    // API returns { company_name, events: [...] }
    const events = data?.events ?? data;
    return Array.isArray(events) ? events : [];
  } catch (err) {
    console.error('[EC] getEvents error:', err);
    return [];
  }
}

export async function getTranscript(
  symbol: string,
  quarter: number,
  year: number,
  exchange: string = 'NASDAQ'
): Promise<TranscriptMeta | null> {
  try {
    const url = `${EC_BASE}/transcript?apikey=${EC_API_KEY}&symbol=${symbol.toUpperCase()}&exchange=${exchange}&year=${year}&quarter=${quarter}`;
    console.log('[EC] getTranscript:', symbol, `Q${quarter}`, year);
    const res = await fetch(url);
    if (!res.ok) {
      // Try NYSE if NASDAQ fails
      if (exchange === 'NASDAQ') {
        return getTranscript(symbol, quarter, year, 'NYSE');
      }
      console.error('[EC] getTranscript failed:', res.status);
      return null;
    }
    const data: ECTranscriptResponse = await res.json();
    if (!data.text) return null;
    return {
      symbol: symbol.toUpperCase(),
      quarter: data.event.quarter,
      year: data.event.year,
      date: data.event.conference_date ?? '',
      content: data.text,
    };
  } catch (err) {
    console.error('[EC] getTranscript error:', err);
    return null;
  }
}

// Search companies - uses the symbols list with local filtering
const POPULAR_COMPANIES: Record<string, { name: string; exchange: string }> = {
  AAPL: { name: 'Apple Inc.', exchange: 'NASDAQ' },
  MSFT: { name: 'Microsoft Corp.', exchange: 'NASDAQ' },
  GOOGL: { name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  AMZN: { name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  TSLA: { name: 'Tesla Inc.', exchange: 'NASDAQ' },
  META: { name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  NVDA: { name: 'NVIDIA Corp.', exchange: 'NASDAQ' },
  NFLX: { name: 'Netflix Inc.', exchange: 'NASDAQ' },
  CRM: { name: 'Salesforce Inc.', exchange: 'NYSE' },
  JPM: { name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  BAC: { name: 'Bank of America Corp.', exchange: 'NYSE' },
  WMT: { name: 'Walmart Inc.', exchange: 'NYSE' },
  DIS: { name: 'The Walt Disney Co.', exchange: 'NYSE' },
  INTC: { name: 'Intel Corp.', exchange: 'NASDAQ' },
  AMD: { name: 'Advanced Micro Devices', exchange: 'NASDAQ' },
  UBER: { name: 'Uber Technologies', exchange: 'NYSE' },
  SNAP: { name: 'Snap Inc.', exchange: 'NYSE' },
  SQ: { name: 'Block Inc.', exchange: 'NYSE' },
  COIN: { name: 'Coinbase Global', exchange: 'NASDAQ' },
  PLTR: { name: 'Palantir Technologies', exchange: 'NASDAQ' },
  MRVL: { name: 'Marvell Technology', exchange: 'NASDAQ' },
  AVGO: { name: 'Broadcom Inc.', exchange: 'NASDAQ' },
  QCOM: { name: 'Qualcomm Inc.', exchange: 'NASDAQ' },
  PYPL: { name: 'PayPal Holdings', exchange: 'NASDAQ' },
  SHOP: { name: 'Shopify Inc.', exchange: 'NYSE' },
  ABNB: { name: 'Airbnb Inc.', exchange: 'NASDAQ' },
  V: { name: 'Visa Inc.', exchange: 'NYSE' },
  MA: { name: 'Mastercard Inc.', exchange: 'NYSE' },
  HD: { name: 'The Home Depot', exchange: 'NYSE' },
  NKE: { name: 'Nike Inc.', exchange: 'NYSE' },
  BA: { name: 'Boeing Co.', exchange: 'NYSE' },
  GS: { name: 'Goldman Sachs', exchange: 'NYSE' },
  MS: { name: 'Morgan Stanley', exchange: 'NYSE' },
  GM: { name: 'General Motors', exchange: 'NYSE' },
  F: { name: 'Ford Motor Co.', exchange: 'NYSE' },
  PFE: { name: 'Pfizer Inc.', exchange: 'NYSE' },
  JNJ: { name: 'Johnson & Johnson', exchange: 'NYSE' },
  UNH: { name: 'UnitedHealth Group', exchange: 'NYSE' },
  KO: { name: 'Coca-Cola Co.', exchange: 'NYSE' },
  PEP: { name: 'PepsiCo Inc.', exchange: 'NASDAQ' },
};

export function searchCompaniesLocal(query: string): { symbol: string; name: string; exchange: string }[] {
  const lower = query.toLowerCase();
  const results: { symbol: string; name: string; exchange: string }[] = [];

  for (const [sym, info] of Object.entries(POPULAR_COMPANIES)) {
    if (
      sym.toLowerCase().includes(lower) ||
      info.name.toLowerCase().includes(lower)
    ) {
      results.push({ symbol: sym, name: info.name, exchange: info.exchange });
    }
  }

  // If query looks like a ticker not in our list, still include it
  if (results.length === 0 && /^[A-Z]{1,5}$/.test(query.toUpperCase())) {
    results.push({ symbol: query.toUpperCase(), name: query.toUpperCase(), exchange: 'NASDAQ' });
  }

  return results;
}

export function getCompanyExchange(symbol: string): string {
  return POPULAR_COMPANIES[symbol.toUpperCase()]?.exchange ?? 'NASDAQ';
}
