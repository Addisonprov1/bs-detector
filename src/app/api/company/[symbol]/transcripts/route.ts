import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getCompanyExchange } from '@/lib/fmp';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const exchange = getCompanyExchange(symbol);
  const events = await getEvents(symbol, exchange);
  const transcripts = events.map((e) => ({ quarter: e.quarter, year: e.year }));
  return NextResponse.json({ transcripts });
}
