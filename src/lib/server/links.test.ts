import { describe, it, expect } from 'vitest';
import { MockKV } from './kv';
import { createLink, getLink } from './links';

function makeKV() {
	return new MockKV() as unknown as {
		get(key: string): Promise<string | null>;
		put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
	};
}

describe('createLink', () => {
	it('creates a new link with a short ID', async () => {
		const kv = makeKV();
		const result = await createLink(kv, 'abc123');

		expect(result.created).toBe(true);
		expect(result.data.shortId).toHaveLength(8);
		expect(result.data.folderId).toBe('abc123');
		expect(result.data.viewCount).toBe(0);
	});

	it('deduplicates same folder ID', async () => {
		const kv = makeKV();
		const first = await createLink(kv, 'abc123');
		const second = await createLink(kv, 'abc123');

		expect(second.created).toBe(false);
		expect(second.data.shortId).toBe(first.data.shortId);
	});

	it('creates different links for different folder IDs', async () => {
		const kv = makeKV();
		const first = await createLink(kv, 'folder1');
		const second = await createLink(kv, 'folder2');

		expect(first.data.shortId).not.toBe(second.data.shortId);
	});

	it('rejects invalid folder IDs', async () => {
		const kv = makeKV();
		await expect(createLink(kv, 'has spaces')).rejects.toThrow('Invalid folder ID');
		await expect(createLink(kv, '<script>')).rejects.toThrow('Invalid folder ID');
		await expect(createLink(kv, '')).rejects.toThrow('Invalid folder ID');
	});

	it('accepts folder IDs with hyphens and underscores', async () => {
		const kv = makeKV();
		const result = await createLink(kv, '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(result.created).toBe(true);
		expect(result.data.folderId).toBe('1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
	});
});

describe('getLink', () => {
	it('retrieves an existing link', async () => {
		const kv = makeKV();
		const { data } = await createLink(kv, 'abc123');
		const retrieved = await getLink(kv, data.shortId);

		expect(retrieved).not.toBeNull();
		expect(retrieved!.folderId).toBe('abc123');
		expect(retrieved!.viewCount).toBe(1);
	});

	it('returns null for non-existent link', async () => {
		const kv = makeKV();
		const result = await getLink(kv, 'nonexistent');
		expect(result).toBeNull();
	});

	it('increments view count on each get', async () => {
		const kv = makeKV();
		const { data } = await createLink(kv, 'abc123');

		await getLink(kv, data.shortId);
		const second = await getLink(kv, data.shortId);

		expect(second!.viewCount).toBe(2);
	});
});
