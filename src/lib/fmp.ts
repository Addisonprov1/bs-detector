import type { TranscriptMeta } from './types';

const FMP_BASE = 'https://financialmodelingprep.com/api';
const API_KEY = process.env.FMP_API_KEY ?? '';

interface FMPTranscript {
  symbol: string;
  quarter: number;
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

interface FMPTranscriptList {
  0: number; // quarter
  1: number; // year
  2: string; // date
}

export async function searchCompanies(query: string): Promise<FMPSearchResult[]> {
  try {
    const url = `${FMP_BASE}/v3/search?query=${encodeURIComponent(query)}&limit=20&apikey=${API_KEY}`;
    console.log('[FMP] searchCompanies:', url.replace(API_KEY, '***'));
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[FMP] searchCompanies failed:', res.status, await res.text());
      return [];
    }
    const data = await res.json();
    console.log('[FMP] searchCompanies results:', data?.length ?? 0);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[FMP] searchCompanies error:', err);
    return [];
  }
}

export async function listAvailableTranscripts(symbol: string): Promise<{ quarter: number; year: number }[]> {
  try {
    // Use the v4 transcript list endpoint (returns available quarters, not full transcripts)
    const url = `${FMP_BASE}/v4/earning_call_transcript?symbol=${symbol.toUpperCase()}&apikey=${API_KEY}`;
    console.log('[FMP] listAvailableTranscripts:', url.replace(API_KEY, '***'));
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[FMP] listAvailableTranscripts failed:', res.status);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    // FMP returns array of [quarter, year, date] tuples or objects
    return data.slice(0, 12).map((item: Record<string, unknown>) => ({
      quarter: Number(item.quarter ?? item[0]),
      year: Number(item.year ?? item[1]),
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
    const url = `${FMP_BASE}/v3/earning_call_transcript/${symbol.toUpperCase()}?quarter=${quarter}&year=${year}&apikey=${API_KEY}`;
    console.log('[FMP] getTranscript:', url.replace(API_KEY, '***'));
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[FMP] getTranscript failed:', res.status);
      return null;
    }
    const data: FMPTranscript[] = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    return {
      symbol: data[0].symbol,
      quarter: data[0].quarter,
      year: data[0].year,
      date: data[0].date,
      content: data[0].content,
    };
  } catch (err) {
    console.error('[FMP] getTranscript error:', err);
    return null;
  }
}
