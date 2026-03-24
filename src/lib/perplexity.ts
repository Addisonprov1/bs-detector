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
      temperature: 0.2,
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

function parseQuarter(q: unknown): number {
  if (typeof q === 'number') return q;
  if (typeof q === 'string') {
    const match = q.match(/(\d)/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

export async function searchEarningsCalls(query: string): Promise<EarningsCallResult[]> {
  try {
    const { content, citations } = await callSonar(
      `You are a financial data assistant. Given a company name or ticker symbol, find their recent quarterly earnings calls. Return ONLY a JSON array (no markdown, no explanation) of objects with these fields: symbol (string, uppercase ticker), companyName (string), quarter (number 1-4, NOT a string like "Q1", just the number), year (number), date (string YYYY-MM-DD or empty string if unknown). Return up to 8 most recent results, sorted newest first. If you cannot find earnings call data, return an empty array [].`,
      `Find recent quarterly earnings calls for: ${query}`,
      'sonar'
    );

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];

    const raw = JSON.parse(arrayMatch[0]);
    const results: EarningsCallResult[] = raw.map((r: Record<string, unknown>) => ({
      symbol: String(r.symbol || '').toUpperCase(),
      companyName: String(r.companyName || r.symbol || ''),
      quarter: parseQuarter(r.quarter),
      year: typeof r.year === 'number' ? r.year : parseInt(String(r.year || '0')),
      date: String(r.date || ''),
      citations,
    }));
    return results.filter((r) => r.quarter > 0 && r.quarter <= 4 && r.year > 2000);
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
      `You are a financial transcript compiler. Your job is to reconstruct earnings call transcripts from all available web sources. Search thoroughly across financial news sites, investor relations pages, and transcript databases. Extract EVERY direct quote, paraphrase, and reported statement from the specified earnings call. Present them in transcript format with speaker names and their exact words. Include:
1. Opening remarks / prepared statements from CEO and CFO
2. Key financial metrics and guidance discussed
3. The full analyst Q&A section with analyst names and questions
4. Management responses with exact quotes where available
Do NOT say you cannot find the transcript. Compile everything available into the most complete version possible. Use direct quotes whenever available.`,
      `Reconstruct the ${symbol} Q${quarter} ${year} earnings call transcript. Extract every available quote from executives and the analyst Q&A. Search Seeking Alpha, Motley Fool, Reuters, Bloomberg, Yahoo Finance, the company IR page, and any other sources. Compile into a complete transcript format with speaker names.`,
      'sonar-pro'
    );

    if (!content || content.length < 200) {
      return null;
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

// === POLITICAL SPEECH ===

export interface PoliticalTranscriptResult {
  speaker: string;
  title: string;
  date: string;
  type: string;
  slug: string;
  citations?: string[];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const POPULAR_POLITICIANS: { name: string; role: string; slug: string; icon: string }[] = [
  { name: 'Donald Trump', role: 'President', slug: 'donald-trump', icon: '\ud83c\udfe4' },
  { name: 'Joe Biden', role: 'Former President', slug: 'joe-biden', icon: '\ud83c\uddfa\ud83c\uddf8' },
  { name: 'Kamala Harris', role: 'Former VP', slug: 'kamala-harris', icon: '\u2696\ufe0f' },
  { name: 'Mitch McConnell', role: 'Senator', slug: 'mitch-mcconnell', icon: '\ud83d\udce2' },
  { name: 'Chuck Schumer', role: 'Senator', slug: 'chuck-schumer', icon: '\ud83d\uddf3\ufe0f' },
  { name: 'Elizabeth Warren', role: 'Senator', slug: 'elizabeth-warren', icon: '\ud83d\udcca' },
  { name: 'Ted Cruz', role: 'Senator', slug: 'ted-cruz', icon: '\u2b50' },
  { name: 'Bernie Sanders', role: 'Senator', slug: 'bernie-sanders', icon: '\u270a' },
  { name: 'Marco Rubio', role: 'Secretary of State', slug: 'marco-rubio', icon: '\ud83c\udf0e' },
  { name: 'Mike Johnson', role: 'House Speaker', slug: 'mike-johnson', icon: '\ud83c\udfe0' },
  { name: 'Hakeem Jeffries', role: 'House Leader', slug: 'hakeem-jeffries', icon: '\ud83c\udfe0' },
  { name: 'Nancy Pelosi', role: 'Rep.', slug: 'nancy-pelosi', icon: '\ud83d\udc69\u200d\u2696\ufe0f' },
  { name: 'Elon Musk', role: 'DOGE', slug: 'elon-musk', icon: '\ud83d\ude80' },
  { name: 'JD Vance', role: 'Vice President', slug: 'jd-vance', icon: '\ud83c\udfe4' },
  { name: 'Pete Hegseth', role: 'Sec. of Defense', slug: 'pete-hegseth', icon: '\ud83c\udf96\ufe0f' },
  { name: 'Jerome Powell', role: 'Fed Chair', slug: 'jerome-powell', icon: '\ud83c\udfe6' },
  { name: 'AOC', role: 'Rep.', slug: 'alexandria-ocasio-cortez', icon: '\ud83d\udca5' },
  { name: 'Ron DeSantis', role: 'Governor', slug: 'ron-desantis', icon: '\ud83c\udf34' },
  { name: 'Gavin Newsom', role: 'Governor', slug: 'gavin-newsom', icon: '\u2600\ufe0f' },
  { name: 'RFK Jr', role: 'HHS Secretary', slug: 'rfk-jr', icon: '\ud83c\udfe5' },
];

export function searchPoliticiansLocal(query: string): typeof POPULAR_POLITICIANS {
  const lower = query.toLowerCase();
  return POPULAR_POLITICIANS.filter(
    (p) => p.name.toLowerCase().includes(lower) || p.role.toLowerCase().includes(lower) || p.slug.includes(lower)
  );
}

export async function searchPoliticalTranscripts(query: string): Promise<PoliticalTranscriptResult[]> {
  try {
    const { content, citations } = await callSonar(
      `You are a political speech research assistant. Given a politician's name, find their recent public speeches, press conferences, congressional hearings, debates, or official statements. Return ONLY a JSON array (no markdown, no explanation) of objects with these fields: speaker (string, full name), title (string, descriptive title of the event), date (string YYYY-MM-DD), type (string, one of: press_conference, hearing, speech, debate, interview, briefing, address). Return up to 8 most recent results, sorted newest first. If you cannot find results, return an empty array [].`,
      `Find recent public speeches, press conferences, hearings, and statements by: ${query}`,
      'sonar'
    );

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];

    const raw = JSON.parse(arrayMatch[0]);
    return raw.map((r: Record<string, unknown>) => ({
      speaker: String(r.speaker || query),
      title: String(r.title || 'Speech'),
      date: String(r.date || ''),
      type: String(r.type || 'speech'),
      slug: slugify(String(r.title || 'speech') + '-' + String(r.date || '')),
      citations,
    }));
  } catch (err) {
    console.error('[Sonar] searchPoliticalTranscripts error:', err);
    return [];
  }
}

export async function getPoliticalTranscriptViaSonar(
  speaker: string,
  title: string,
  date: string
): Promise<{ content: string; citations: string[]; speaker: string; title: string; date: string } | null> {
  try {
    const { content, citations } = await callSonar(
      `You are a political transcript compiler. Reconstruct the specified political speech, press conference, hearing, or statement from all available web sources. Extract EVERY direct quote, exchange, and reported statement. Present in transcript format with speaker names. Include:
1. Opening statements and prepared remarks
2. All questions from reporters/senators/representatives
3. Full responses with exact quotes
4. Any notable exchanges or confrontations
Do NOT say you cannot find the transcript. Compile everything available. Use direct quotes whenever possible.`,
      `Reconstruct the transcript of "${title}" by ${speaker} on ${date}. Extract every available quote and exchange from C-SPAN, White House transcripts, congressional records, Reuters, AP, CNN, and any other news sources.`,
      'sonar-pro'
    );

    if (!content || content.length < 200) {
      return null;
    }

    return { content, citations, speaker, title, date };
  } catch (err) {
    console.error('[Sonar] getPoliticalTranscriptViaSonar error:', err);
    return null;
  }
}

// === EARNINGS CALLS - Local company database for instant autocomplete ===
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

  if (results.length === 0 && /^[A-Z]{1,5}$/.test(query.toUpperCase())) {
    results.push({ symbol: query.toUpperCase(), name: query.toUpperCase(), exchange: 'NASDAQ' });
  }

  return results;
}
