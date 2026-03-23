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
  evasion: { label: 'Evasion & Non-Answers', color: '#ff4444', bgColor: 'rgba(255,68,68,0.15)' },
  hedging: { label: 'Hedging & Uncertainty', color: '#ffcc00', bgColor: 'rgba(255,204,0,0.15)' },
  distancing: { label: 'Distancing', color: '#00ff88', bgColor: 'rgba(0,255,136,0.15)' },
  persuasion: { label: 'Persuasion Overload', color: '#ff8800', bgColor: 'rgba(255,136,0,0.15)' },
  cognitiveLoad: { label: 'Cognitive Load', color: '#4488ff', bgColor: 'rgba(68,136,255,0.15)' },
  emotionalLeakage: { label: 'Emotional Leakage', color: '#cc44ff', bgColor: 'rgba(204,68,255,0.15)' },
  strategicOmission: { label: 'Strategic Omission', color: '#00cccc', bgColor: 'rgba(0,204,204,0.15)' },
};

export function getScoreColor(score: number): string {
  if (score <= 25) return '#00ff88';
  if (score <= 50) return '#ffcc00';
  if (score <= 75) return '#ff8800';
  return '#ff4444';
}

export function getSeverityLabel(score: number): AnalysisResult['severityLabel'] {
  if (score <= 25) return 'LOW BS';
  if (score <= 50) return 'MODERATE';
  if (score <= 75) return 'HIGH BS';
  return 'EXTREME';
}
