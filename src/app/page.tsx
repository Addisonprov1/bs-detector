import { CommandPalette } from '@/components/CommandPalette';
import { PasteTranscript } from '@/components/PasteTranscript';
import { PopularTickers } from '@/components/PopularTickers';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4">
      {/* Centered search area — Perplexity style */}
      <div className="w-full max-w-2xl mx-auto -mt-16">
        <div className="text-center mb-8">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-2"
            style={{ color: 'white', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
          >
            BS Detector
          </h1>
          <p
            className="text-sm"
            style={{ color: 'rgba(255,255,255,0.8)', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}
          >
            AI-powered earnings call deception analysis
          </p>
        </div>

        {/* Search window */}
        <div className="win-window">
          <div className="win-title-bar">
            <span>Search Earnings Calls</span>
            <div className="win-buttons"><span /><span /><span /></div>
          </div>
          <div className="win-body p-3">
            <CommandPalette />
          </div>
        </div>

        {/* Desktop icons grid */}
        <div className="mt-8">
          <PopularTickers />
        </div>

        {/* Paste option */}
        <div className="text-center mt-6">
          <PasteTranscript />
        </div>
      </div>
    </div>
  );
}
