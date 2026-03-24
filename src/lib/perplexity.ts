import type { TranscriptMeta } from './types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const API_KEY = process.env.PERPLEXITY_API_KEY || '';

interface SonarResponse {
  choices: { message: { content: string } }[];
  citations?: string[];
}

interface EarningsCallResult {
  symbol: string;
  companyName: string;
  quarter: number;
  year: number;
  date: string;
  citations?: string[];
}

async function callSonar(
  systemPrompt: string,
  userPrompt: string,
  model: 'sonar' | 'sonar-pro' = 'sonar'
): Promise<{ content: string; citations: string[] }> {
  const res = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: model === 'sonar-pro' ? 16000 : 4000,
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Sonar] API error:', res.status, err);
    throw new Error(`Perplexity API error: ${res.status}`);
  }

  const data: SonarResponse = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    citations: data.citations ?? [],
  };
}

export async function searchEarningsCalls(query: string): Promise<EarningsCallResult[]> {
  try {
    const { content, citations } = await callSonar(
      `You are a financial data assistant. Given a company name or ticker symbol, find their recent quarterly earnings calls. Return ONLY a JSON array (no markdown, no explanation) of objects with these fields: symbol (string, uppercase ticker), companyName (string), quarter (number 1-4), year (number), date (string YYYY-MM-DD or empty string if unknown). Return up to 8 most recent results, sorted newest first. If you cannot find earnings call data, return an empty array [].`,
      `Find recent quarterly earnings calls for: ${query}`,
      'sonar'
    );

    // Parse JSON from response
    let jsonStr = content.trim();
    // Strip markdown code fences if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    // Find the JSON array in the response
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];

    const results: EarningsCallResult[] = JSON.parse(arrayMatch[0]);
    return results.map((r) => ({ ...r, citations }));
  } catch (err) {
    console.error('[Sonar] searchEarningsCalls error:', err);
    return [];
  }
}

export async function getTranscriptViaSonar(
  symbol: string,
  quarter: number,
  year: number
): Promise<(TranscriptMeta & { citations: string[] }) | null> {
  try {
    const { content, citations } = await callSonar(
      `You are a financial transcript assistant. Return the full earnings call transcript for the requested company and quarter. Include all speaker names (CEO, CFO, analysts), their prepared remarks, and the full Q&A section. Be as complete and detailed as possible. Include exact quotes and statements. Do NOT summarize — provide the actual transcript text. If you cannot find the full transcript, provide as much of the actual transcript content as you can find, including key quotes and exchanges.`,
      `Full earnings call transcript for ${symbol} Q${quarter} ${year}. Include all prepared remarks and Q&A.`,
      'sonar-pro'
    );

    if (!content || content.length < 500) {
      // Retry with more specific prompt
      console.log('[Sonar] Short response, retrying with specific prompt...');
      const retry = await callSonar(
        `You are a financial transcript assistant. Provide the most complete version possible of the earnings call transcript. Include every speaker, every question from analysts, and every answer from management. Provide exact quotes. Do not summarize.`,
        `I need the complete Q${quarter} ${year} earnings call transcript for ${symbol} (ticker). Please provide the full prepared remarks from the CEO and CFO, followed by the complete analyst Q&A section. Include all speaker names and their exact words.`,
        'sonar-pro'
      );
      if (retry.content.length > content.length) {
        return {
          symbol: symbol.toUpperCase(),
          quarter,
          year,
          date: '',
          content: retry.content,
          citations: retry.citations,
        };
      }
    }

    return {
      symbol: symbol.toUpperCase(),
      quarter,
      year,
      date: '',
      content,
      citations,
    };
  } catch (err) {
    console.error('[Sonar] getTranscriptViaSonar error:', err);
    return null;
  }
}

// Local company database for instant autocomplete
export const POPULAR_COMPANIES: Record<string, { name: string; exchange: string }> = {
  AAPL: { name: 'Apple Inc.', exchange: 'NASDAQ' },
  MSFT: { name: 'Microsoft Corp.', exchange: 'NASDAQ' },
  GOOGL: { name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  AMZN: { name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  TSLA: { name: 'Tesla Inc.', exchange: 'NASDAQ' },
  META: { name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  NVDA: { name: 'NVIDIA Corp.', exchange: 'NASDAQ' },
  NFLX: { name: 'Netflix Inc.', exchange: 'NASDAQ' },
  CRM: { name: 'Salesforce Inc.', exchange: 'NYSE' },
  JPM: { name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  BAC: { name: 'Bank of America Corp.', exchange: 'NYSE' },
  WMT: { name: 'Walmart Inc.', exchange: 'NYSE' },
  DIS: { name: 'The Walt Disney Co.', exchange: 'NYSE' },
  INTC: { name: 'Intel Corp.', exchange: 'NASDAQ' },
  AMD: { name: 'Advanced Micro Devices', exchange: 'NASDAQ' },
  UBER: { name: 'Uber Technologies', exchange: 'NYSE' },
  SNAP: { name: 'Snap Inc.', exchange: 'NYSE' },
  SQ: { name: 'Block Inc.', exchange: 'NYSE' },
  COIN: { name: 'Coinbase Global', exchange: 'NASDAQ' },
  PLTR: { name: 'Palantir Technologies', exchange: 'NASDAQ' },
  MRVL: { name: 'Marvell Technology', exchange: 'NASDAQ' },
  AVGO: { name: 'Broadcom Inc.', exchange: 'NASDAQ' },
  QCOM: { name: 'Qualcomm Inc.', exchange: 'NASDAQ' },
  PYPL: { name: 'PayPal Holdings', exchange: 'NASDAQ' },
  SHOP: { name: 'Shopify Inc.', exchange: 'NYSE' },
  ABNB: { name: 'Airbnb Inc.', exchange: 'NASDAQ' },
  V: { name: 'Visa Inc.', exchange: 'NYSE' },
  MA: { name: 'Mastercard Inc.', exchange: 'NYSE' },
  HD: { name: 'The Home Depot', exchange: 'NYSE' },
  NKE: { name: 'Nike Inc.', exchange: 'NYSE' },
  BA: { name: 'Boeing Co.', exchange: 'NYSE' },
  GS: { name: 'Goldman Sachs', exchange: 'NYSE' },
  MS: { name: 'Morgan Stanley', exchange: 'NYSE' },
  GM: { name: 'General Motors', exchange: 'NYSE' },
  F: { name: 'Ford Motor Co.', exchange: 'NYSE' },
  PFE: { name: 'Pfizer Inc.', exchange: 'NYSE' },
  JNJ: { name: 'Johnson & Johnson', exchange: 'NYSE' },
  UNH: { name: 'UnitedHealth Group', exchange: 'NYSE' },
  KO: { name: 'Coca-Cola Co.', exchange: 'NYSE' },
  PEP: { name: 'PepsiCo Inc.', exchange: 'NASDAQ' },
};

export function searchCompaniesLocal(query: string): { symbol: string; name: string; exchange: string }[] {
  const lower = query.toLowerCase();
  const results: { symbol: string; name: string; exchange: string }[] = [];

  for (const [sym, info] of Object.entries(POPULAR_COMPANIES)) {
    if (
      sym.toLowerCase().includes(lower) ||
      info.name.toLowerCase().includes(lower)
    ) {
      results.push({ symbol: sym, name: info.name, exchange: info.exchange });
    }
  }

  // If query looks like a ticker not in our list, still include it
  if (results.length === 0 && /^[A-Z]{1,5}$/.test(query.toUpperCase())) {
    results.push({ symbol: query.toUpperCase(), name: query.toUpperCase(), exchange: 'NASDAQ' });
  }

  return results;
}
