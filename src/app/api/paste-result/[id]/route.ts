import { NextRequest, NextResponse } from 'next/server';
import { getPasteResult } from '@/lib/paste-cache';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = getPasteResult(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Analysis not found or expired. Please re-submit your transcript.' },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
