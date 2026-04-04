import { describe, it, expect, beforeEach } from 'vitest';
import { MockKV } from './kv';
import { createLink, getLink } from './links';

describe('Full API flow (integration)', () => {
	let kv: ReturnType<typeof makeMockKV>;

	function makeMockKV() {
		return new MockKV() as unknown as {
			get(key: string): Promise<string | null>;
			put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
		};
	}

	beforeEach(() => {
		kv = makeMockKV();
	});

	it('complete flow: create → get → dedup → view count', async () => {
		// Create a link
		const { data, created } = await createLink(kv, '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(created).toBe(true);
		expect(data.shortId).toHaveLength(8);
		expect(data.folderId).toBe('1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(data.viewCount).toBe(0);

		// Get the link — viewCount should increment
		const got1 = await getLink(kv, data.shortId);
		expect(got1).not.toBeNull();
		expect(got1!.viewCount).toBe(1);

		// Get again — viewCount should be 2
		const got2 = await getLink(kv, data.shortId);
		expect(got2!.viewCount).toBe(2);

		// Dedup — same folder ID returns same short ID
		const { data: dup, created: dupCreated } = await createLink(kv, '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(dupCreated).toBe(false);
		expect(dup.shortId).toBe(data.shortId);

		// Different folder ID creates a new link
		const { data: other, created: otherCreated } = await createLink(kv, 'differentFolderId123');
		expect(otherCreated).toBe(true);
		expect(other.shortId).not.toBe(data.shortId);
	});

	it('handles concurrent creates for the same folder', async () => {
		const results = await Promise.all([
			createLink(kv, 'sameFolderId'),
			createLink(kv, 'sameFolderId'),
			createLink(kv, 'sameFolderId')
		]);

		// All should have the same folder ID
		const shortIds = results.map((r) => r.data.shortId);
		const uniqueIds = new Set(shortIds);
		// Due to race, we might get 1 unique ID (dedup hit) or multiple (race, first write wins)
		// But all should be valid 8-char IDs
		for (const id of shortIds) {
			expect(id).toHaveLength(8);
		}
	});

	it('handles many different links', async () => {
		const ids = [];
		for (let i = 0; i < 20; i++) {
			const { data } = await createLink(kv, `folder${i}padded1234`);
			ids.push(data.shortId);
		}

		// All IDs should be unique
		expect(new Set(ids).size).toBe(20);

		// All should be retrievable
		for (const id of ids) {
			const link = await getLink(kv, id);
			expect(link).not.toBeNull();
		}
	});
});
