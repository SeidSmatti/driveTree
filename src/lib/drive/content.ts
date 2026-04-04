/**
 * File content utilities.
 *
 * Viewing: fetches through our server proxy (/api/file/:id) to avoid CORS.
 * Download: uses direct Google Drive URLs (browser navigation, no CORS issue).
 */

const DRIVE_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=';

const GOOGLE_DOC_TYPES: Record<string, { label: string; ext: string }> = {
	'application/vnd.google-apps.document': { label: 'Google Doc', ext: 'pdf' },
	'application/vnd.google-apps.spreadsheet': { label: 'Google Sheet', ext: 'csv' },
	'application/vnd.google-apps.presentation': { label: 'Google Slides', ext: 'pdf' }
};

export function isGoogleDoc(mimeType: string): boolean {
	return mimeType in GOOGLE_DOC_TYPES;
}

export function getGoogleDocInfo(mimeType: string) {
	return GOOGLE_DOC_TYPES[mimeType] ?? null;
}

/** Direct Drive URL for browser navigation (download). Not subject to CORS. */
export function getDirectDownloadUrl(fileId: string): string {
	return DRIVE_DOWNLOAD_URL + encodeURIComponent(fileId);
}

/** Our server proxy URL for fetching content (avoids CORS). */
export function getProxyUrl(fileId: string): string {
	return `/api/file/${encodeURIComponent(fileId)}`;
}

/** Fetch file text content through our server proxy. */
export async function fetchFileText(fileId: string, signal?: AbortSignal): Promise<string> {
	const res = await fetch(getProxyUrl(fileId), { signal });
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Failed to load file' }));
		throw new Error(body.error || `Failed to load file (${res.status})`);
	}
	return res.text();
}

/** Fetch file as blob through our server proxy. */
export async function fetchFileBlob(fileId: string, signal?: AbortSignal): Promise<Blob> {
	const res = await fetch(getProxyUrl(fileId), { signal });
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Failed to load file' }));
		throw new Error(body.error || `Failed to load file (${res.status})`);
	}
	return res.blob();
}

/** Determine how a file should be rendered */
export type RenderMode = 'text' | 'image' | 'pdf' | 'binary' | 'google-doc';

const TEXT_EXTENSIONS = new Set([
	'txt', 'md', 'markdown', 'rst', 'log', 'csv', 'tsv',
	'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
	'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp', 'cs',
	'php', 'swift', 'kt', 'scala', 'sh', 'bash', 'zsh', 'fish',
	'html', 'htm', 'css', 'scss', 'less', 'vue', 'svelte', 'astro',
	'json', 'yaml', 'yml', 'toml', 'xml', 'ini', 'conf', 'cfg', 'env',
	'sql', 'r', 'lua', 'pl', 'ex', 'exs', 'zig', 'nim', 'dart', 'v',
	'makefile', 'dockerfile', 'gitignore', 'editorconfig',
]);

export function getRenderMode(mimeType: string, name: string): RenderMode {
	if (isGoogleDoc(mimeType)) return 'google-doc';
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType === 'application/pdf') return 'pdf';
	if (mimeType.startsWith('text/')) return 'text';

	const ext = name.split('.').pop()?.toLowerCase() ?? '';
	if (TEXT_EXTENSIONS.has(ext) || TEXT_EXTENSIONS.has(name.toLowerCase())) return 'text';
	if (mimeType === 'application/json' || mimeType === 'application/xml' || mimeType === 'application/javascript') return 'text';

	return 'binary';
}

/** Map file extension to Shiki language ID */
export function getLanguageId(name: string): string {
	const ext = name.split('.').pop()?.toLowerCase() ?? '';
	const map: Record<string, string> = {
		js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
		ts: 'typescript', tsx: 'tsx',
		py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
		java: 'java', c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp', cs: 'csharp',
		php: 'php', swift: 'swift', kt: 'kotlin', scala: 'scala',
		sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'fish',
		html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
		vue: 'vue', svelte: 'svelte',
		json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
		xml: 'xml', sql: 'sql', r: 'r', lua: 'lua',
		md: 'markdown', markdown: 'markdown', rst: 'markdown',
		dockerfile: 'dockerfile', makefile: 'makefile',
		txt: 'text', log: 'text', csv: 'csv',
	};
	return map[ext] ?? map[name.toLowerCase()] ?? 'text';
}
