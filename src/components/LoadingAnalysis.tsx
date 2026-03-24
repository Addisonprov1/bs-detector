'use client';

import { useState, useEffect } from 'react';

const PHASES = [
  'Fetching transcript via Perplexity...',
  'Analyzing evasion patterns...',
  'Detecting hedging language...',
  'Evaluating persuasion overload...',
  'Scanning for distancing signals...',
  'Measuring cognitive load indicators...',
  'Checking emotional leakage...',
  'Identifying strategic omissions...',
  'Computing composite score...',
];

export function LoadingAnalysis({ symbol, quarter, year }: { symbol: string; quarter: number; year: number }) {
  const [phase, setPhase] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => {
        if (p < PHASES.length - 1) {
          setLines((prev) => [...prev, `[\u2713] ${PHASES[p]}`]);
          return p + 1;
        }
        return p;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const progress = ((phase + 1) / PHASES.length) * 100;

  return (
    <div className="max-w-lg mx-auto py-20 px-4">
      <div className="win-window">
        <div className="win-title-bar">
          <span>Analyzing {symbol} Q{quarter} {year}...</span>
          <div className="win-buttons"><span /><span /><span /></div>
        </div>
        <div className="win-body p-4">
          <div className="font-mono text-xs space-y-1 mb-4 max-h-48 overflow-y-auto">
            <div className="text-[#808080] mb-2">
              C:\BS_DETECTOR&gt; analyze --transcript {symbol.toLowerCase()}-q{quarter}-{year}
            </div>

            {lines.map((line, i) => (
              <div key={i} className="text-[#16a34a]">
                {line}
              </div>
            ))}

            <div className="text-[#1a1a1a] cursor-blink">
              {PHASES[phase]}
            </div>
          </div>

          {/* Win98-style progress bar */}
          <div
            className="h-4 relative overflow-hidden"
            style={{
              border: '2px solid',
              borderColor: '#808080 #dfdfdf #dfdfdf #808080',
              background: '#ffffff',
            }}
          >
            <div
              className="h-full transition-all duration-1000 flex"
              style={{ width: `${progress}%` }}
            >
              {Array.from({ length: Math.ceil(progress / 8) }).map((_, i) => (
                <div
                  key={i}
                  className="h-full w-2 mr-0.5"
                  style={{ background: '#000080' }}
                />
              ))}
            </div>
          </div>
          <div className="text-[10px] text-[#808080] text-center mt-1">
            {Math.round(progress)}% complete
          </div>
        </div>
      </div>
    </div>
  );
}
