'use client';

import { useState } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { PasteTranscript } from '@/components/PasteTranscript';
import { PopularTickers } from '@/components/PopularTickers';
import { PopularPoliticians } from '@/components/PopularPoliticians';

type Mode = 'earnings' | 'political';

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('earnings');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4">
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
            AI-powered deception analysis
          </p>
        </div>

        {/* Search window with Win98 tabs */}
        <div className="win-window">
          {/* Tab bar */}
          <div className="flex" style={{ background: '#c0c0c0', paddingLeft: '4px', paddingTop: '2px' }}>
            <button
              onClick={() => setMode('earnings')}
              className="px-4 py-1 text-xs font-bold cursor-pointer relative"
              style={{
                background: mode === 'earnings' ? '#ffffff' : '#c0c0c0',
                border: '1px solid',
                borderColor: mode === 'earnings'
                  ? '#dfdfdf #808080 #ffffff #dfdfdf'
                  : '#dfdfdf #808080 #808080 #dfdfdf',
                borderBottom: mode === 'earnings' ? '1px solid #ffffff' : '1px solid #808080',
                marginBottom: mode === 'earnings' ? '-1px' : '0',
                zIndex: mode === 'earnings' ? 2 : 1,
                color: mode === 'earnings' ? '#000' : '#808080',
              }}
            >
              Earnings Calls
            </button>
            <button
              onClick={() => setMode('political')}
              className="px-4 py-1 text-xs font-bold cursor-pointer relative"
              style={{
                background: mode === 'political' ? '#ffffff' : '#c0c0c0',
                border: '1px solid',
                borderColor: mode === 'political'
                  ? '#dfdfdf #808080 #ffffff #dfdfdf'
                  : '#dfdfdf #808080 #808080 #dfdfdf',
                borderBottom: mode === 'political' ? '1px solid #ffffff' : '1px solid #808080',
                marginBottom: mode === 'political' ? '-1px' : '0',
                zIndex: mode === 'political' ? 2 : 1,
                color: mode === 'political' ? '#000' : '#808080',
              }}
            >
              Political Speech
            </button>
          </div>

          <div className="win-title-bar">
            <span>{mode === 'political' ? 'Search Political Speech' : 'Search Earnings Calls'}</span>
            <div className="win-buttons"><span /><span /><span /></div>
          </div>
          <div className="win-body p-3">
            <CommandPalette mode={mode} />
          </div>
        </div>

        {/* Desktop icons grid */}
        <div className="mt-8">
          {mode === 'political' ? <PopularPoliticians /> : <PopularTickers />}
        </div>

        {/* Paste option */}
        <div className="text-center mt-6">
          <PasteTranscript />
        </div>
      </div>
    </div>
  );
}
