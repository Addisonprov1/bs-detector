export interface AnalysisResult {
  compositeScore: number;
  severityLabel: 'LOW BS' | 'MODERATE' | 'HIGH BS' | 'EXTREME';
  categories: {
    evasion: CategoryResult;
    hedging: CategoryResult;
    distancing: CategoryResult;
    persuasion: CategoryResult;
    cognitiveLoad: CategoryResult;
    emotionalLeakage: CategoryResult;
    strategicOmission: CategoryResult;
  };
  flaggedExcerpts: FlaggedExcerpt[];
  summary: string;
}

export interface CategoryResult {
  score: number;
  subIndicators: {
    id: string;
    name: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  explanation: string;
}

export interface FlaggedExcerpt {
  text: string;
  category: string;
  subIndicator: string;
  subIndicatorName: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface TranscriptMeta {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
  content: string;
  citations?: string[];
}

export interface LeaderboardEntry {
  symbol: string;
  company: string;
  quarter: number;
  year: number;
  date: string;
  compositeScore: number;
  severityLabel: string;
  trend?: number;
}

export type CategoryKey = keyof AnalysisResult['categories'];

export const CATEGORY_META: Record<CategoryKey, { label: string; color: string; bgColor: string }> = {
  evasion: { label: 'Evasion & Non-Answers', color: '#dc2626', bgColor: 'rgba(220,38,38,0.12)' },
  hedging: { label: 'Hedging & Uncertainty', color: '#ca8a04', bgColor: 'rgba(202,138,4,0.12)' },
  distancing: { label: 'Distancing', color: '#16a34a', bgColor: 'rgba(22,163,74,0.12)' },
  persuasion: { label: 'Persuasion Overload', color: '#ea580c', bgColor: 'rgba(234,88,12,0.12)' },
  cognitiveLoad: { label: 'Cognitive Load', color: '#2563eb', bgColor: 'rgba(37,99,235,0.12)' },
  emotionalLeakage: { label: 'Emotional Leakage', color: '#9333ea', bgColor: 'rgba(147,51,234,0.12)' },
  strategicOmission: { label: 'Strategic Omission', color: '#0891b2', bgColor: 'rgba(8,145,178,0.12)' },
};

export function getScoreColor(score: number): string {
  if (score <= 25) return '#16a34a';
  if (score <= 50) return '#ca8a04';
  if (score <= 75) return '#ea580c';
  return '#dc2626';
}

export function getSeverityLabel(score: number): AnalysisResult['severityLabel'] {
  if (score <= 25) return 'LOW BS';
  if (score <= 50) return 'MODERATE';
  if (score <= 75) return 'HIGH BS';
  return 'EXTREME';
}
