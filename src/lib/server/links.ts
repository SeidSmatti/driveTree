import { nanoid } from 'nanoid';

export interface LinkData {
	shortId: string;
	folderId: string;
	created: string;
	lastAccessed: string;
	viewCount: number;
}

interface KV {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export async function createLink(kv: KV, folderId: string): Promise<{ data: LinkData; created: boolean }> {
	if (!/^[a-zA-Z0-9_-]+$/.test(folderId)) {
		throw new Error('Invalid folder ID');
	}

	// Check for existing link (dedup)
	const existing = await kv.get(`folder:${folderId}`);
	if (existing) {
		const data = JSON.parse(existing) as LinkData;
		return { data, created: false };
	}

	const shortId = nanoid(8);
	const now = new Date().toISOString();
	const data: LinkData = {
		shortId,
		folderId,
		created: now,
		lastAccessed: now,
		viewCount: 0
	};

	const json = JSON.stringify(data);
	await Promise.all([
		kv.put(`link:${shortId}`, json),
		kv.put(`folder:${folderId}`, json)
	]);

	return { data, created: true };
}

export async function getLink(kv: KV, shortId: string): Promise<LinkData | null> {
	const raw = await kv.get(`link:${shortId}`);
	if (!raw) return null;

	const data = JSON.parse(raw) as LinkData;
	data.viewCount++;
	data.lastAccessed = new Date().toISOString();

	// Fire-and-forget — don't block the response on view count update
	kv.put(`link:${shortId}`, JSON.stringify(data)).catch(() => {});

	return data;
}
