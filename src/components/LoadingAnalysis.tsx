'use client';

import { useState, useEffect } from 'react';

const PHASES = [
  'Fetching transcript...',
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
          setLines((prev) => [...prev, `[✓] ${PHASES[p]}`]);
          return p + 1;
        }
        return p;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto py-20 px-4">
      <div className="text-center mb-8">
        <span className="font-mono font-bold text-lg">{symbol}</span>
        <span className="text-[var(--color-text-muted)] text-sm ml-2">
          Q{quarter} {year}
        </span>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-4 font-mono text-xs">
        <div className="text-[var(--color-text-muted)] mb-3">
          $ analyze --transcript {symbol.toLowerCase()}-q{quarter}-{year}
        </div>

        {lines.map((line, i) => (
          <div key={i} className="text-[var(--color-accent-green)] mb-1">
            {line}
          </div>
        ))}

        <div className="text-[var(--color-accent-green)] cursor-blink">
          {PHASES[phase]}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-[var(--color-border)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent-green)] transition-all duration-1000"
            style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
