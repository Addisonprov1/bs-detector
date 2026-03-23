import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript } from '@/lib/analyzer';

export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const { transcript, ticker } = await request.json();

    if (!transcript || transcript.trim().length < 500) {
      return NextResponse.json(
        { error: 'Transcript must be at least 500 characters.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeTranscript(transcript);

    return NextResponse.json({
      analysis,
      transcript,
      meta: {
        symbol: ticker || 'CUSTOM',
        quarter: 0,
        year: 0,
        date: new Date().toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('Paste analysis failed:', err);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again later.' },
      { status: 500 }
    );
  }
}
