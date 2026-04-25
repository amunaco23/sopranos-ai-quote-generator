const requests = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const LIMIT = 10;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = (requests.get(ip) ?? []).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= LIMIT) {
    const retryAfter = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  requests.set(ip, timestamps);
  return { allowed: true };
}
