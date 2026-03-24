import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript } from '@/lib/analyzer';
import { storePasteResult } from '@/lib/paste-cache';

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

    const result = {
      analysis,
      transcript,
      meta: {
        symbol: ticker || 'CUSTOM',
        quarter: 0,
        year: 0,
        date: new Date().toISOString().split('T')[0],
      },
    };

    // Store in server-side cache and return UUID
    const id = storePasteResult(result);

    return NextResponse.json({ id });
  } catch (err) {
    console.error('Paste analysis failed:', err);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again later.' },
      { status: 500 }
    );
  }
}
