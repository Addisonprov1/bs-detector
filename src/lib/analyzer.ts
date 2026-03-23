import Anthropic from '@anthropic-ai/sdk';
import { TAXONOMY_PROMPT } from './taxonomy';
import type { AnalysisResult } from './types';

const anthropic = new Anthropic();

export async function analyzeTranscript(transcript: string): Promise<AnalysisResult> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: TAXONOMY_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this earnings call transcript:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  let jsonStr = textBlock.text.trim();
  // Strip markdown code fences if present
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const result: AnalysisResult = JSON.parse(jsonStr);
  return result;
}
