import { CommandPalette } from '@/components/CommandPalette';
import { Leaderboard } from '@/components/Leaderboard';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Earnings Call BS Detector
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          AI-powered deception analysis backed by research
        </p>
      </div>

      {/* Search */}
      <CommandPalette />

      {/* Leaderboard */}
      <div className="mt-16" id="leaderboard">
        <Leaderboard entries={[]} />
      </div>
    </div>
  );
}
