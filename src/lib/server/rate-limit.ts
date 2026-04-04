/**
 * Simple KV-based rate limiter.
 * Tracks request counts per key with a TTL window.
 */

interface KV {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export async function checkRateLimit(
	kv: KV,
	key: string,
	maxRequests: number,
	windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
	const rlKey = `rl:${key}`;
	const raw = await kv.get(rlKey);

	const now = Math.floor(Date.now() / 1000);
	let count = 0;
	let windowStart = now;

	if (raw) {
		const data = JSON.parse(raw);
		if (data.start && now - data.start < windowSeconds) {
			count = data.count ?? 0;
			windowStart = data.start;
		}
	}

	if (count >= maxRequests) {
		return { allowed: false, remaining: 0 };
	}

	count++;
	await kv.put(rlKey, JSON.stringify({ count, start: windowStart }), {
		expirationTtl: windowSeconds
	});

	return { allowed: true, remaining: maxRequests - count };
}
