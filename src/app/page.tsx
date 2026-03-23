import { CommandPalette } from '@/components/CommandPalette';
import { PasteTranscript } from '@/components/PasteTranscript';
import { PopularTickers } from '@/components/PopularTickers';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-3xl">&#x1f4a9;</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Earnings Call BS Detector
          </h1>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
          AI-powered deception analysis using CIA-derived methodology, linguistic forensics, and behavioral assessment
        </p>
      </div>

      {/* Search */}
      <CommandPalette />

      {/* Popular tickers grid */}
      <div className="mt-12">
        <PopularTickers />
      </div>

      {/* Paste option */}
      <div className="text-center mt-10 pt-8 border-t border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
          Or analyze any transcript
        </p>
        <PasteTranscript />
      </div>
    </div>
  );
}
