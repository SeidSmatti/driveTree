import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getKV } from '$lib/server/kv';
import { getLink } from '$lib/server/links';

export const GET: RequestHandler = async ({ params, platform }) => {
	const { links } = getKV(platform);
	const data = await getLink(links, params.shortId);

	if (!data) {
		return json({ error: 'not found' }, { status: 404 });
	}

	return json(data);
};
