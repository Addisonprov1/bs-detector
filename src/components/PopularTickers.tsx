'use client';

import { useRouter } from 'next/navigation';

const TICKERS = [
  { symbol: 'AAPL', name: 'Apple', sector: 'Tech', icon: '&#127823;' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Tech', icon: '&#128187;' },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Tech', icon: '&#128269;' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Tech', icon: '&#128230;' },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Auto', icon: '&#9889;' },
  { symbol: 'META', name: 'Meta', sector: 'Tech', icon: '&#128064;' },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Chips', icon: '&#129302;' },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Media', icon: '&#127916;' },
  { symbol: 'JPM', name: 'JPMorgan', sector: 'Finance', icon: '&#127974;' },
  { symbol: 'BAC', name: 'BofA', sector: 'Finance', icon: '&#128176;' },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'Finance', icon: '&#128200;' },
  { symbol: 'DIS', name: 'Disney', sector: 'Media', icon: '&#127917;' },
  { symbol: 'COIN', name: 'Coinbase', sector: 'Crypto', icon: '&#129689;' },
  { symbol: 'CRM', name: 'Salesforce', sector: 'SaaS', icon: '&#9729;' },
  { symbol: 'UBER', name: 'Uber', sector: 'Transport', icon: '&#128663;' },
  { symbol: 'PLTR', name: 'Palantir', sector: 'Data', icon: '&#128065;' },
  { symbol: 'AMD', name: 'AMD', sector: 'Chips', icon: '&#128308;' },
  { symbol: 'BA', name: 'Boeing', sector: 'Defense', icon: '&#9992;' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Pharma', icon: '&#128138;' },
  { symbol: 'SNAP', name: 'Snap', sector: 'Social', icon: '&#128123;' },
];

export function PopularTickers() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-mono">
          Popular Companies
        </h2>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          Click to see available earnings calls
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {TICKERS.map((t) => (
          <button
            key={t.symbol}
            onClick={() => router.push(`/company/${t.symbol}`)}
            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-accent-green)]/30 hover:bg-[var(--color-accent-green)]/[0.03] transition-all text-left cursor-pointer"
          >
            <span
              className="text-base opacity-60 group-hover:opacity-100 transition-opacity"
              dangerouslySetInnerHTML={{ __html: t.icon }}
            />
            <div className="min-w-0">
              <div className="font-mono text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-green)] transition-colors truncate">
                {t.symbol}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                {t.name}
              </div>
            </div>
            <span className="ml-auto text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded font-mono shrink-0">
              {t.sector}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
