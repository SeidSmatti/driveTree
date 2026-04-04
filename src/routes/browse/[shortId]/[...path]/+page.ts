import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/links/${params.shortId}`);

	if (!res.ok) {
		if (res.status === 404) {
			error(404, 'Link not found');
		}
		error(500, 'Failed to load link');
	}

	const link = await res.json();

	return {
		shortId: params.shortId,
		folderId: link.folderId,
		path: params.path || ''
	};
};
