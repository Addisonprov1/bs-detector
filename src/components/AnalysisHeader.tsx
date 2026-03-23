import { CircularScore } from './ui/ScoreBadge';
import type { AnalysisResult } from '@/lib/types';
import { getScoreColor } from '@/lib/types';

interface Props {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
  analysis: AnalysisResult;
}

export function AnalysisHeader({ symbol, quarter, year, date, analysis }: Props) {
  const color = getScoreColor(analysis.compositeScore);

  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div>
        <a
          href="/"
          className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          ← Back to results
        </a>
        <h1 className="text-2xl font-bold mt-1">
          {symbol}{' '}
          <span className="text-sm font-normal text-[var(--color-text-muted)]">
            Q{quarter} {year} Earnings Call
          </span>
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">{date}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl">
          {analysis.summary}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <CircularScore score={analysis.compositeScore} size={80} />
        <span
          className="text-[10px] font-bold tracking-wider"
          style={{ color }}
        >
          {analysis.severityLabel}
        </span>
      </div>
    </div>
  );
}
