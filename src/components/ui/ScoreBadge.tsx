'use client';

import { getScoreColor } from '@/lib/types';

export function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = getScoreColor(score);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-lg',
  };

  return (
    <span
      className={`font-mono font-bold rounded ${sizeClasses[size]} inline-flex items-center`}
      style={{ backgroundColor: color, color: score > 75 ? '#fff' : '#000' }}
    >
      {score}
    </span>
  );
}

export function CircularScore({ score, size = 80 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const pct = Math.min(score, 100);
  const innerSize = size * 0.75;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${color} 0% ${pct}%, var(--color-border) ${pct}% 100%)`,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: innerSize,
            height: innerSize,
            backgroundColor: 'var(--color-bg-primary)',
          }}
        >
          <span className="font-mono font-extrabold text-xl" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
    </div>
  );
}
