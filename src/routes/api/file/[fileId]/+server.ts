import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { getDriveFileContent, DriveApiError } from '$lib/server/drive-api';

const MAX_PROXY_SIZE = 5 * 1024 * 1024; // 5 MB

export const GET: RequestHandler = async ({ params }) => {
	const apiKey = env.GOOGLE_DRIVE_API_KEY ?? '';
	const { fileId } = params;

	if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
		return jsonError('Invalid file ID', 400);
	}

	try {
		const res = await getDriveFileContent(fileId, apiKey);

		const contentLength = res.headers.get('content-length');
		if (contentLength && parseInt(contentLength) > MAX_PROXY_SIZE) {
			return jsonError('File too large to preview (> 5 MB). Use the download button instead.', 413);
		}

		const contentType = res.headers.get('content-type') ?? 'application/octet-stream';

		return new Response(res.body, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=3600',
				...(contentLength ? { 'Content-Length': contentLength } : {})
			}
		});
	} catch (e) {
		if (e instanceof DriveApiError) {
			return jsonError(e.message, e.status >= 500 ? 502 : e.status);
		}
		return jsonError('Failed to fetch file from Drive', 502);
	}
};

function jsonError(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}
