// Inline SVG icons — 16x16, uses currentColor for theming
const svgFolder = '<svg width="16" height="16" viewBox="0 0 16 16" fill="#d29922"><path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7H1.75z"/></svg>';
const svgFile = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"/></svg>';
const svgCode = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.72 3.22a.75.75 0 011.06 1.06L2.56 7.5l3.22 3.22a.75.75 0 01-1.06 1.06l-3.75-3.75a.75.75 0 010-1.06l3.75-3.75zm6.56 0a.75.75 0 10-1.06 1.06L13.44 7.5l-3.22 3.22a.75.75 0 101.06 1.06l3.75-3.75a.75.75 0 000-1.06l-3.75-3.75z"/></svg>';
const svgImage = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M16 13.25A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5zM1.75 2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H1.75zM3.5 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9.06 3.94l-2.53-2.53a.75.75 0 00-1.06 0L5.22 11.66a.75.75 0 001.06 1.06l3.47-3.47 2.28 2.28a.75.75 0 001.06-1.06l-.53-.03z"/></svg>';
const svgPdf = '<svg width="16" height="16" viewBox="0 0 16 16" fill="#f85149"><path d="M3.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"/><path d="M4.5 9.5a.5.5 0 01.5-.5h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h4a.5.5 0 010 1H5a.5.5 0 01-.5-.5z"/></svg>';
const svgArchive = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1.75v11.5c0 .09.048.173.126.217a.25.25 0 00.249.008l4.125-2.063 4.125 2.063a.25.25 0 00.375-.217V1.75A1.75 1.75 0 0010.75 0H5.25A1.75 1.75 0 003.5 1.75zM5.25 1.5h5.5a.25.25 0 01.25.25v9.91l-3.375-1.688a.25.25 0 00-.25 0L4 11.66V1.75a.25.25 0 01.25-.25z"/></svg>';
const svgData = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2a1 1 0 011-1h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V14a1 1 0 01-1 1H3a1 1 0 01-1-1V2zm6 0v3.5a.5.5 0 00.5.5H12L8 2zM4.5 8a.5.5 0 000 1h7a.5.5 0 000-1h-7zm0 2a.5.5 0 000 1h7a.5.5 0 000-1h-7zm0 2a.5.5 0 000 1h4a.5.5 0 000-1h-4z"/></svg>';

const CODE_EXTENSIONS = new Set([
	'js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp',
	'cs', 'php', 'swift', 'kt', 'scala', 'sh', 'bash', 'zsh', 'fish',
	'html', 'css', 'scss', 'less', 'vue', 'svelte', 'astro',
	'sql', 'r', 'lua', 'pl', 'ex', 'exs', 'zig', 'nim', 'dart', 'v'
]);

const DATA_EXTENSIONS = new Set([
	'json', 'yaml', 'yml', 'toml', 'xml', 'csv', 'tsv', 'ini', 'conf', 'cfg', 'env'
]);

const IMAGE_PREFIXES = ['image/'];
const ARCHIVE_EXTENSIONS = new Set(['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar', 'tgz']);

const MIME_MAP: Record<string, string> = {
	'application/vnd.google-apps.folder': svgFolder,
	'application/pdf': svgPdf,
};

export function getFileIcon(mimeType: string, name?: string): string {
	if (MIME_MAP[mimeType]) return MIME_MAP[mimeType];

	if (IMAGE_PREFIXES.some((p) => mimeType.startsWith(p))) return svgImage;

	const ext = (name ?? '').split('.').pop()?.toLowerCase() ?? '';
	if (ARCHIVE_EXTENSIONS.has(ext)) return svgArchive;
	if (CODE_EXTENSIONS.has(ext)) return svgCode;
	if (DATA_EXTENSIONS.has(ext)) return svgData;

	if (mimeType.startsWith('text/')) return svgFile;
	return svgFile;
}

export function formatSize(bytes: number): string {
	if (bytes === 0) return '';
	const units = ['B', 'KB', 'MB', 'GB'];
	let i = 0;
	let size = bytes;
	while (size >= 1024 && i < units.length - 1) {
		size /= 1024;
		i++;
	}
	return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[i]}`;
}

export function formatDate(isoString: string): string {
	if (!isoString) return '';
	const date = new Date(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = diffMs / (1000 * 60 * 60);

	if (diffHours < 1) return 'just now';
	if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
	if (diffHours < 48) return 'yesterday';

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 30) return `${diffDays}d ago`;

	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
