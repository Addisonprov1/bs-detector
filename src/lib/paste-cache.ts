// Simple in-memory cache for paste analysis results with 1hr TTL
const cache = new Map<string, { data: unknown; expires: number }>();

const TTL = 60 * 60 * 1000; // 1 hour

// Clean expired entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires < now) cache.delete(key);
  }
}

export function storePasteResult(data: unknown): string {
  cleanup();
  const id = crypto.randomUUID();
  cache.set(id, { data, expires: Date.now() + TTL });
  return id;
}

export function getPasteResult(id: string): unknown | null {
  const entry = cache.get(id);
  if (!entry || entry.expires < Date.now()) {
    cache.delete(id);
    return null;
  }
  return entry.data;
}
