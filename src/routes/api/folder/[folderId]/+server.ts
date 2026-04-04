import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { getKV } from '$lib/server/kv';
import { listDriveFolder, DriveApiError } from '$lib/server/drive-api';

const CACHE_TTL = 3600; // 1 hour
const STALE_CACHE_TTL = 86400; // 24 hours fallback

export const GET: RequestHandler = async ({ params, platform }) => {
	const apiKey = env.GOOGLE_DRIVE_API_KEY ?? '';
	const { folderId } = params;

	if (!/^[a-zA-Z0-9_-]+$/.test(folderId)) {
		return json({ error: 'Invalid folder ID' }, { status: 400 });
	}

	const { meta } = getKV(platform);
	const cacheKey = `folder:${folderId}`;
	const staleCacheKey = `folder-stale:${folderId}`;

	// Check fresh cache
	const cached = await meta.get(cacheKey);
	if (cached) {
		const data = JSON.parse(cached);
		return json({ files: data.files, folderName: data.folderName ?? '', cached: true, cachedAt: data.cachedAt }, {
			headers: { 'Cache-Control': 'public, max-age=300' }
		});
	}

	// Fetch from Drive API
	try {
		const { files, folderName } = await listDriveFolder(folderId, apiKey);
		const cachedAt = new Date().toISOString();
		const payload = JSON.stringify({ files, folderName, cachedAt });

		await Promise.all([
			meta.put(cacheKey, payload, { expirationTtl: CACHE_TTL }),
			meta.put(staleCacheKey, payload, { expirationTtl: STALE_CACHE_TTL })
		]);

		return json({ files, folderName, cached: false, cachedAt }, {
			headers: { 'Cache-Control': 'public, max-age=300' }
		});
	} catch (e) {
		// On API failure, try stale cache
		if (e instanceof DriveApiError && (e.status === 403 || e.status === 429)) {
			const stale = await meta.get(staleCacheKey);
			if (stale) {
				const data = JSON.parse(stale);
				return json({
					files: data.files,
					folderName: data.folderName ?? '',
					cached: true,
					cachedAt: data.cachedAt,
					stale: true,
					warning: 'Drive API quota limited. Showing cached data which may be up to 24 hours old.'
				});
			}
		}

		if (e instanceof DriveApiError) {
			return json({ error: e.message }, { status: e.status >= 500 ? 502 : e.status });
		}

		console.error('Drive API error:', e);
		return json({ error: 'Failed to fetch folder from Google Drive' }, { status: 502 });
	}
};
