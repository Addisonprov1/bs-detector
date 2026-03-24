import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript } from '@/lib/analyzer';
import { getTranscriptViaSonar } from '@/lib/perplexity';

export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const { symbol, quarter, year } = await request.json();

    if (!symbol || !quarter || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, quarter, year' },
        { status: 400 }
      );
    }

    // Fetch transcript via Perplexity Sonar
    const transcript = await getTranscriptViaSonar(symbol, quarter, year);
    if (!transcript || !transcript.content) {
      return NextResponse.json(
        { error: 'Transcript not available for this earnings call.' },
        { status: 404 }
      );
    }

    // Analyze with Claude
    const analysis = await analyzeTranscript(transcript.content);

    return NextResponse.json({
      analysis,
      transcript: transcript.content,
      meta: {
        symbol: transcript.symbol,
        quarter: transcript.quarter,
        year: transcript.year,
        date: transcript.date,
        citations: transcript.citations,
      },
    });
  } catch (err) {
    console.error('Analysis failed:', err);
    const message = err instanceof Error ? err.message : 'Analysis failed';

    if (message.includes('rate_limit') || message.includes('429')) {
      return NextResponse.json(
        { error: 'Analysis queue is busy. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Analysis failed. Please try again later.' },
      { status: 500 }
    );
  }
}
