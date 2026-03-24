'use client';

import { useRouter } from 'next/navigation';

const TICKERS = [
  { symbol: 'AAPL', name: 'Apple', icon: '\ud83c\udf4e' },
  { symbol: 'MSFT', name: 'Microsoft', icon: '\ud83d\udcbb' },
  { symbol: 'GOOGL', name: 'Alphabet', icon: '\ud83d\udd0d' },
  { symbol: 'AMZN', name: 'Amazon', icon: '\ud83d\udce6' },
  { symbol: 'TSLA', name: 'Tesla', icon: '\u26a1' },
  { symbol: 'META', name: 'Meta', icon: '\ud83d\udc40' },
  { symbol: 'NVDA', name: 'NVIDIA', icon: '\ud83e\udd16' },
  { symbol: 'NFLX', name: 'Netflix', icon: '\ud83c\udfa5' },
  { symbol: 'JPM', name: 'JPMorgan', icon: '\ud83c\udfe6' },
  { symbol: 'COIN', name: 'Coinbase', icon: '\ud83e\ude99' },
  { symbol: 'CRM', name: 'Salesforce', icon: '\u2601\ufe0f' },
  { symbol: 'UBER', name: 'Uber', icon: '\ud83d\ude97' },
  { symbol: 'PLTR', name: 'Palantir', icon: '\ud83d\udc41\ufe0f' },
  { symbol: 'BA', name: 'Boeing', icon: '\u2708\ufe0f' },
  { symbol: 'DIS', name: 'Disney', icon: '\ud83c\udfa0' },
  { symbol: 'GS', name: 'Goldman', icon: '\ud83d\udcc8' },
  { symbol: 'AMD', name: 'AMD', icon: '\ud83d\udd34' },
  { symbol: 'PFE', name: 'Pfizer', icon: '\ud83d\udc8a' },
  { symbol: 'SNAP', name: 'Snap', icon: '\ud83d\udc7b' },
  { symbol: 'BAC', name: 'BofA', icon: '\ud83d\udcb0' },
];

export function PopularTickers() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {TICKERS.map((t) => (
        <button
          key={t.symbol}
          onClick={() => router.push(`/company/${t.symbol}`)}
          className="desktop-icon"
          title={t.name}
        >
          <div className="desktop-icon-img">{t.icon}</div>
          <div className="desktop-icon-label">{t.symbol}</div>
        </button>
      ))}
    </div>
  );
}
