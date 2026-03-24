'use client';

import { useRouter } from 'next/navigation';
import { POPULAR_POLITICIANS } from '@/lib/perplexity';

export function PopularPoliticians() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {POPULAR_POLITICIANS.map((p) => (
        <button
          key={p.slug}
          onClick={() => router.push(`/political/${p.slug}`)}
          className="desktop-icon"
          title={`${p.name} - ${p.role}`}
        >
          <div className="desktop-icon-img">{p.icon}</div>
          <div className="desktop-icon-label">{p.name.split(' ').pop()}</div>
        </button>
      ))}
    </div>
  );
}
