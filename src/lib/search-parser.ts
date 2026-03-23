export interface ParsedFilters {
  symbols: string[];
  sector: string | null;
  quarter: number | null;
  year: number | null;
  scoreMin: number | null;
  scoreMax: number | null;
  sort: 'score_desc' | 'score_asc' | 'trend_desc' | 'newest' | null;
  freeText: string;
}

const SECTORS = ['tech', 'technology', 'finance', 'financial', 'healthcare', 'health', 'energy', 'consumer', 'industrial', 'materials', 'utilities', 'real estate', 'communication'];

const SECTOR_MAP: Record<string, string> = {
  tech: 'Technology',
  technology: 'Technology',
  finance: 'Financial Services',
  financial: 'Financial Services',
  healthcare: 'Healthcare',
  health: 'Healthcare',
  energy: 'Energy',
  consumer: 'Consumer Cyclical',
  industrial: 'Industrials',
  materials: 'Basic Materials',
  utilities: 'Utilities',
  'real estate': 'Real Estate',
  communication: 'Communication Services',
};

export function parseSearchQuery(query: string): ParsedFilters {
  const result: ParsedFilters = {
    symbols: [],
    sector: null,
    quarter: null,
    year: null,
    scoreMin: null,
    scoreMax: null,
    sort: null,
    freeText: '',
  };

  if (!query.trim()) return result;

  let remaining = query.toLowerCase().trim();

  // Sort keywords
  if (remaining.includes('most bs') || remaining.includes('biggest liars') || remaining.includes('worst')) {
    result.sort = 'score_desc';
    remaining = remaining.replace(/most bs|biggest liars|worst/g, '').trim();
  } else if (remaining.includes('least bs') || remaining.includes('straight shooter') || remaining.includes('best') || remaining.includes('most honest')) {
    result.sort = 'score_asc';
    remaining = remaining.replace(/least bs|straight shooter|best|most honest/g, '').trim();
  } else if (remaining.includes('rising bs') || remaining.includes('trending')) {
    result.sort = 'trend_desc';
    remaining = remaining.replace(/rising bs|trending/g, '').trim();
  } else if (remaining.includes('newest') || remaining.includes('latest') || remaining.includes('recent')) {
    result.sort = 'newest';
    remaining = remaining.replace(/newest|latest|recent/g, '').trim();
  }

  // Score filters: "bs > 70", "score < 30", "bs 70-100"
  const scoreRange = remaining.match(/(?:bs|score)\s*(\d+)\s*-\s*(\d+)/);
  if (scoreRange) {
    result.scoreMin = parseInt(scoreRange[1]);
    result.scoreMax = parseInt(scoreRange[2]);
    remaining = remaining.replace(scoreRange[0], '').trim();
  }
  const scoreGt = remaining.match(/(?:bs|score)\s*>\s*(\d+)/);
  if (scoreGt) {
    result.scoreMin = parseInt(scoreGt[1]);
    remaining = remaining.replace(scoreGt[0], '').trim();
  }
  const scoreLt = remaining.match(/(?:bs|score)\s*<\s*(\d+)/);
  if (scoreLt) {
    result.scoreMax = parseInt(scoreLt[1]);
    remaining = remaining.replace(scoreLt[0], '').trim();
  }

  // Quarter: "q1", "q4 2025"
  const quarterMatch = remaining.match(/q([1-4])\s*(\d{4})?/);
  if (quarterMatch) {
    result.quarter = parseInt(quarterMatch[1]);
    if (quarterMatch[2]) result.year = parseInt(quarterMatch[2]);
    remaining = remaining.replace(quarterMatch[0], '').trim();
  }

  // Year alone: "2025"
  if (!result.year) {
    const yearMatch = remaining.match(/\b(20[2-3]\d)\b/);
    if (yearMatch) {
      result.year = parseInt(yearMatch[1]);
      remaining = remaining.replace(yearMatch[0], '').trim();
    }
  }

  // Sector
  for (const sector of SECTORS) {
    if (remaining.includes(sector)) {
      result.sector = SECTOR_MAP[sector] ?? sector;
      remaining = remaining.replace(sector, '').trim();
      break;
    }
  }

  // Tickers: 1-5 uppercase letters (check original query for case)
  const tickerMatches = query.match(/\b[A-Z]{1,5}\b/g);
  if (tickerMatches) {
    result.symbols = tickerMatches;
    for (const t of tickerMatches) {
      remaining = remaining.replace(t.toLowerCase(), '').trim();
    }
  }

  // Clean up filler words
  remaining = remaining
    .replace(/\b(show|me|the|in|for|from|with|and|or|a|an|of|sector)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  result.freeText = remaining;
  return result;
}
