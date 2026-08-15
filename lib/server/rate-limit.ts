interface RateBucket {
  count: number;
  resetAt: number;
}

declare global {
  var eduDiscoverRateBuckets: Map<string, RateBucket> | undefined;
}

const buckets = globalThis.eduDiscoverRateBuckets || new Map<string, RateBucket>();
globalThis.eduDiscoverRateBuckets = buckets;

export function checkRateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    pruneBuckets(now);
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  return {
    allowed: current.count <= limit,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
  };
}

function pruneBuckets(now: number) {
  if (buckets.size < 5_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
