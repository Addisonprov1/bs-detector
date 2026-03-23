import type { TranscriptMeta } from './types';

const FMP_BASE = 'https://financialmodelingprep.com';
const API_KEY = process.env.FMP_API_KEY ?? '';

interface FMPTranscriptResponse {
  symbol: string;
  period: string;
  year: number;
  date: string;
  content: string;
}

interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export async function searchCompanies(query: string): Promise<FMPSearchResult[]> {
  try {
    // Use the stable search-name endpoint
    const url = `${FMP_BASE}/stable/search-name?query=${encodeURIComponent(query)}&limit=20&apikey=${API_KEY}`;
    console.log('[FMP] searchCompanies:', url.replace(API_KEY, '***'));
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error('[FMP] searchCompanies failed:', res.status, text);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    // Map response to our interface (stable API uses different field names)
    return data.map((item: Record<string, string>) => ({
      symbol: item.symbol,
      name: item.name,
      currency: item.currency ?? '',
      stockExchange: item.exchangeFullName ?? item.exchange ?? '',
      exchangeShortName: item.exchange ?? '',
    }));
  } catch (err) {
    console.error('[FMP] searchCompanies error:', err);
    return [];
  }
}

export async function listAvailableTranscripts(symbol: string): Promise<{ quarter: number; year: number }[]> {
  try {
    // Use the stable transcript dates endpoint
    const url = `${FMP_BASE}/stable/earning-call-transcript-dates?symbol=${symbol.toUpperCase()}&apikey=${API_KEY}`;
    console.log('[FMP] listAvailableTranscripts:', url.replace(API_KEY, '***'));
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[FMP] listAvailableTranscripts failed:', res.status);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    // Response: [{ quarter: 1, fiscalYear: 2025, date: "2025-01-30" }]
    return data.slice(0, 20).map((item: Record<string, unknown>) => ({
      quarter: Number(item.quarter),
      year: Number(item.fiscalYear),
    }));
  } catch (err) {
    console.error('[FMP] listAvailableTranscripts error:', err);
    return [];
  }
}

export async function getTranscript(
  symbol: string,
  quarter: number,
  year: number
): Promise<TranscriptMeta | null> {
  try {
    // Use the stable endpoint: /stable/earning-call-transcript?symbol=AAPL&year=2020&quarter=3
    const url = `${FMP_BASE}/stable/earning-call-transcript?symbol=${symbol.toUpperCase()}&year=${year}&quarter=${quarter}&apikey=${API_KEY}`;
    console.log('[FMP] getTranscript:', url.replace(API_KEY, '***'));
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[FMP] getTranscript failed:', res.status);
      return null;
    }
    const data: FMPTranscriptResponse[] = await res.json();
    if (!Array.isArray(data) || !data.length) return null;

    // Parse quarter from period string (e.g., "Q3" -> 3)
    const qNum = parseInt(data[0].period?.replace('Q', '') ?? String(quarter));

    return {
      symbol: data[0].symbol,
      quarter: qNum,
      year: data[0].year,
      date: data[0].date,
      content: data[0].content,
    };
  } catch (err) {
    console.error('[FMP] getTranscript error:', err);
    return null;
  }
}
