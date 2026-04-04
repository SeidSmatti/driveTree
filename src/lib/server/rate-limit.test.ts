import { describe, it, expect } from 'vitest';
import { MockKV } from './kv';
import { checkRateLimit } from './rate-limit';

function makeKV() {
	return new MockKV() as unknown as {
		get(key: string): Promise<string | null>;
		put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
	};
}

describe('checkRateLimit', () => {
	it('allows requests under the limit', async () => {
		const kv = makeKV();
		const r1 = await checkRateLimit(kv, 'ip:1.2.3.4', 3, 3600);
		expect(r1.allowed).toBe(true);
		expect(r1.remaining).toBe(2);

		const r2 = await checkRateLimit(kv, 'ip:1.2.3.4', 3, 3600);
		expect(r2.allowed).toBe(true);
		expect(r2.remaining).toBe(1);
	});

	it('blocks requests over the limit', async () => {
		const kv = makeKV();
		await checkRateLimit(kv, 'ip:1.2.3.4', 2, 3600);
		await checkRateLimit(kv, 'ip:1.2.3.4', 2, 3600);
		const r3 = await checkRateLimit(kv, 'ip:1.2.3.4', 2, 3600);
		expect(r3.allowed).toBe(false);
		expect(r3.remaining).toBe(0);
	});

	it('tracks different keys independently', async () => {
		const kv = makeKV();
		await checkRateLimit(kv, 'ip:1.1.1.1', 1, 3600);
		const blocked = await checkRateLimit(kv, 'ip:1.1.1.1', 1, 3600);
		expect(blocked.allowed).toBe(false);

		const other = await checkRateLimit(kv, 'ip:2.2.2.2', 1, 3600);
		expect(other.allowed).toBe(true);
	});
});
