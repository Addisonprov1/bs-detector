import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript } from '@/lib/analyzer';
import { getPoliticalTranscriptViaSonar } from '@/lib/perplexity';

export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const { speaker, title, date } = await request.json();

    if (!speaker || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: speaker, title' },
        { status: 400 }
      );
    }

    console.log(`[political analyze] Fetching transcript: ${speaker} - ${title}...`);
    const transcript = await getPoliticalTranscriptViaSonar(speaker, title, date || '');

    if (!transcript || !transcript.content) {
      return NextResponse.json(
        { error: `Could not find transcript for "${title}" by ${speaker}. Try pasting the transcript manually.` },
        { status: 404 }
      );
    }

    console.log(`[political analyze] Got ${transcript.content.length} chars, analyzing...`);
    const analysis = await analyzeTranscript(transcript.content);

    return NextResponse.json({
      analysis,
      transcript: transcript.content,
      meta: {
        speaker: transcript.speaker,
        title: transcript.title,
        date: transcript.date,
        citations: transcript.citations,
      },
    });
  } catch (err) {
    console.error('Political analysis failed:', err);
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
