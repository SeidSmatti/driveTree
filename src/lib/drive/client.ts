import type { FileNode } from './types';

export class DriveError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'DriveError';
	}
}

export interface FolderResult {
	files: FileNode[];
	folderName?: string;
	cached: boolean;
	cachedAt: string;
	stale?: boolean;
	warning?: string;
}

/**
 * Fetch folder contents from our server API (which scrapes Google Drive
 * and caches results). No API key needed — the server handles everything.
 */
export async function listFolder(
	folderId: string,
	fetchFn: typeof fetch = fetch
): Promise<FolderResult> {
	const res = await fetchFn(`/api/folder/${encodeURIComponent(folderId)}`);

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Unknown error' }));
		throw new DriveError(res.status, body.error || `Failed to load folder (${res.status})`);
	}

	return res.json();
}
