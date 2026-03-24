import { NextRequest, NextResponse } from 'next/server';
import { searchEarningsCalls } from '@/lib/perplexity';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const results = await searchEarningsCalls(symbol);
  const transcripts = results.map((r) => ({ quarter: r.quarter, year: r.year }));
  return NextResponse.json({ transcripts });
}
