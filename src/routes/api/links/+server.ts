import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getKV } from '$lib/server/kv';
import { createLink } from '$lib/server/links';
import { checkRateLimit } from '$lib/server/rate-limit';

const RATE_LIMIT = 20; // links per hour per IP
const RATE_WINDOW = 3600; // 1 hour

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const { links, meta } = getKV(platform);

	// Rate limit by IP
	const ip = getClientAddress();
	const { allowed, remaining } = await checkRateLimit(meta, `ip:${ip}`, RATE_LIMIT, RATE_WINDOW);
	if (!allowed) {
		return json(
			{ error: 'Too many links created. Please try again later.' },
			{
				status: 429,
				headers: { 'Retry-After': String(RATE_WINDOW), 'X-RateLimit-Remaining': '0' }
			}
		);
	}

	const body = await request.json();
	const folderId = body?.folderId;

	if (!folderId || typeof folderId !== 'string') {
		return json({ error: 'folderId is required' }, { status: 400 });
	}

	try {
		const result = await createLink(links, folderId);
		const url = `/browse/${result.data.shortId}`;
		return json(
			{ shortId: result.data.shortId, url, created: result.data.created },
			{
				status: result.created ? 201 : 409,
				headers: { 'X-RateLimit-Remaining': String(remaining) }
			}
		);
	} catch (e) {
		if (e instanceof Error && e.message === 'Invalid folder ID') {
			return json({ error: 'Invalid folder ID' }, { status: 400 });
		}
		throw e;
	}
};
