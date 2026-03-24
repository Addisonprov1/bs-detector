import { CircularScore } from './ui/ScoreBadge';
import type { AnalysisResult } from '@/lib/types';
import { getScoreColor } from '@/lib/types';

interface Props {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
  analysis: AnalysisResult;
  citations?: string[];
}

export function AnalysisHeader({ symbol, quarter, year, date, analysis, citations }: Props) {
  const color = getScoreColor(analysis.compositeScore);

  return (
    <div className="win-window">
      <div className="win-title-bar">
        <span>
          {symbol} {quarter > 0 ? `Q${quarter} ${year}` : ''} - Analysis Results
        </span>
        <div className="win-buttons"><span /><span /><span /></div>
      </div>
      <div className="win-body p-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <a
              href="/"
              className="text-xs text-[#808080] hover:text-[#000080] transition-colors"
            >
              &larr; Back to search
            </a>
            <h1 className="text-xl font-bold mt-1 text-[#1a1a1a]">
              {symbol}{' '}
              <span className="text-sm font-normal text-[#808080]">
                {quarter > 0 ? `Q${quarter} ${year} Earnings Call` : 'Custom Transcript Analysis'}
              </span>
            </h1>
            {date && <p className="text-xs text-[#808080] mt-0.5">{date}</p>}
            <p className="text-sm text-[#444] mt-2 max-w-xl leading-relaxed">
              {analysis.summary}
            </p>

            {citations && citations.length > 0 && (
              <div className="mt-3 text-xs text-[#808080]">
                <span className="font-bold text-[#444]">Sources: </span>
                {citations.slice(0, 3).map((url, i) => (
                  <span key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#000080] underline hover:text-[#0000ff]"
                    >
                      [{i + 1}]
                    </a>
                    {i < Math.min(citations.length, 3) - 1 && ' '}
                  </span>
                ))}
                <span className="ml-1 italic">via Perplexity</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0">
            <CircularScore score={analysis.compositeScore} size={80} />
            <span
              className="text-[10px] font-bold tracking-wider"
              style={{ color }}
            >
              {analysis.severityLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
