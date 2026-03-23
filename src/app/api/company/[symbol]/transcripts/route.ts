import { NextRequest, NextResponse } from 'next/server';
import { listAvailableTranscripts } from '@/lib/fmp';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const transcripts = await listAvailableTranscripts(symbol);
  return NextResponse.json({ transcripts });
}
