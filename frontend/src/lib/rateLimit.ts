type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

export function rateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens: MAX_REQUESTS, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  if (elapsed > WINDOW_MS) {
    bucket.tokens = MAX_REQUESTS;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}
