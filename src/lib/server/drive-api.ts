import type { FileNode } from '$lib/drive/types';
import { GOOGLE_DRIVE_API_KEY } from '$env/static/private';

const API_BASE = 'https://www.googleapis.com/drive/v3/files';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

export class DriveApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'DriveApiError';
	}
}

/**
 * List all children of a public Google Drive folder using the Drive API v3.
 * Handles pagination automatically.
 */
export async function listDriveFolder(folderId: string): Promise<{ files: FileNode[]; folderName: string }> {
	const apiKey = GOOGLE_DRIVE_API_KEY;
	if (!apiKey) {
		throw new DriveApiError(500, 'Google Drive API key not configured');
	}

	// Fetch folder metadata for the name
	const folderName = await getFolderName(folderId, apiKey);

	// Fetch all children with pagination
	const allFiles: FileNode[] = [];
	let pageToken: string | undefined;

	do {
		const params = new URLSearchParams({
			q: `'${folderId}' in parents and trashed = false`,
			key: apiKey,
			fields: 'files(id,name,mimeType,size,modifiedTime),nextPageToken',
			pageSize: '1000',
			orderBy: 'folder,name'
		});
		if (pageToken) params.set('pageToken', pageToken);

		const res = await fetch(`${API_BASE}?${params}`);

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			const msg = body?.error?.message ?? `Drive API returned ${res.status}`;

			if (res.status === 404) throw new DriveApiError(404, 'Folder not found');
			if (res.status === 403) throw new DriveApiError(403, 'Folder is not public or API quota exceeded');
			throw new DriveApiError(res.status, msg);
		}

		const data = await res.json();

		for (const file of data.files ?? []) {
			const isFolder = file.mimeType === FOLDER_MIME;
			allFiles.push({
				id: file.id,
				name: file.name,
				mimeType: file.mimeType,
				size: file.size ? parseInt(file.size, 10) : 0,
				modifiedTime: file.modifiedTime ?? '',
				isFolder,
				children: isFolder ? null : []
			});
		}

		pageToken = data.nextPageToken;
	} while (pageToken);

	return { files: sortNodes(allFiles), folderName };
}

/**
 * Get the content of a public file from Google Drive.
 * Returns a Response with the file body streamed.
 */
export async function getDriveFileContent(fileId: string): Promise<Response> {
	const apiKey = GOOGLE_DRIVE_API_KEY;
	if (!apiKey) {
		throw new DriveApiError(500, 'Google Drive API key not configured');
	}

	const res = await fetch(`${API_BASE}/${encodeURIComponent(fileId)}?alt=media&key=${apiKey}`);

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		const msg = body?.error?.message ?? `Drive API returned ${res.status}`;
		throw new DriveApiError(res.status, msg);
	}

	return res;
}

async function getFolderName(folderId: string, apiKey: string): Promise<string> {
	try {
		const params = new URLSearchParams({
			key: apiKey,
			fields: 'name'
		});
		const res = await fetch(`${API_BASE}/${encodeURIComponent(folderId)}?${params}`);
		if (res.ok) {
			const data = await res.json();
			return data.name ?? '';
		}
	} catch {
		// Non-critical — folder name is cosmetic
	}
	return '';
}

function sortNodes(nodes: FileNode[]): FileNode[] {
	return nodes.sort((a, b) => {
		if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
		return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
	});
}
