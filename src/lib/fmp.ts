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

export async function searchCompanies(query: string): Promise<FMPSearchResult[]> {
  const res = await fetch(
    `${FMP_BASE}/v3/search?query=${encodeURIComponent(query)}&limit=20&apikey=${API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function listTranscripts(symbol: string): Promise<TranscriptMeta[]> {
  const res = await fetch(
    `${FMP_BASE}/v4/batch_earning_call_transcript/${symbol.toUpperCase()}?apikey=${API_KEY}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];
  const data: FMPTranscript[] = await res.json();
  return data.map((t) => ({
    symbol: t.symbol,
    quarter: t.quarter,
    year: t.year,
    date: t.date,
    content: t.content,
  }));
}

export async function getTranscript(
  symbol: string,
  quarter: number,
  year: number
): Promise<TranscriptMeta | null> {
  const res = await fetch(
    `${FMP_BASE}/v3/earning_call_transcript/${symbol.toUpperCase()}?quarter=${quarter}&year=${year}&apikey=${API_KEY}`,
    { next: { revalidate: 604800 } }
  );
  if (!res.ok) return null;
  const data: FMPTranscript[] = await res.json();
  if (!data.length) return null;
  return {
    symbol: data[0].symbol,
    quarter: data[0].quarter,
    year: data[0].year,
    date: data[0].date,
    content: data[0].content,
  };
}
