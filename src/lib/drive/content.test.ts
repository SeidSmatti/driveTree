import { describe, it, expect } from 'vitest';
import { getRenderMode, getLanguageId, getDirectDownloadUrl, getProxyUrl, isGoogleDoc } from './content';

describe('getRenderMode', () => {
	it('returns text for text MIME types', () => {
		expect(getRenderMode('text/plain', 'file.txt')).toBe('text');
		expect(getRenderMode('text/html', 'page.html')).toBe('text');
		expect(getRenderMode('text/markdown', 'README.md')).toBe('text');
	});

	it('returns text for code files by extension', () => {
		expect(getRenderMode('application/octet-stream', 'main.py')).toBe('text');
		expect(getRenderMode('application/octet-stream', 'index.ts')).toBe('text');
		expect(getRenderMode('application/octet-stream', 'main.go')).toBe('text');
	});

	it('returns text for JSON/XML', () => {
		expect(getRenderMode('application/json', 'data.json')).toBe('text');
		expect(getRenderMode('application/xml', 'config.xml')).toBe('text');
	});

	it('returns text for special filenames', () => {
		expect(getRenderMode('application/octet-stream', 'Makefile')).toBe('text');
		expect(getRenderMode('application/octet-stream', 'Dockerfile')).toBe('text');
	});

	it('returns image for image types', () => {
		expect(getRenderMode('image/png', 'photo.png')).toBe('image');
		expect(getRenderMode('image/jpeg', 'photo.jpg')).toBe('image');
	});

	it('returns pdf for PDF', () => {
		expect(getRenderMode('application/pdf', 'doc.pdf')).toBe('pdf');
	});

	it('returns google-doc for Google Workspace types', () => {
		expect(getRenderMode('application/vnd.google-apps.document', 'My Doc')).toBe('google-doc');
		expect(getRenderMode('application/vnd.google-apps.spreadsheet', 'Sheet')).toBe('google-doc');
	});

	it('returns binary for unknown types', () => {
		expect(getRenderMode('application/octet-stream', 'data.bin')).toBe('binary');
		expect(getRenderMode('application/zip', 'archive.zip')).toBe('binary');
	});
});

describe('getLanguageId', () => {
	it('maps common extensions', () => {
		expect(getLanguageId('main.py')).toBe('python');
		expect(getLanguageId('index.ts')).toBe('typescript');
		expect(getLanguageId('main.go')).toBe('go');
		expect(getLanguageId('query.sql')).toBe('sql');
	});

	it('handles special filenames', () => {
		expect(getLanguageId('Dockerfile')).toBe('dockerfile');
		expect(getLanguageId('Makefile')).toBe('makefile');
	});

	it('returns text for unknown', () => {
		expect(getLanguageId('data.xyz')).toBe('text');
	});
});

describe('URLs', () => {
	it('getDirectDownloadUrl returns Drive download URL', () => {
		const url = getDirectDownloadUrl('abc123');
		expect(url).toContain('drive.google.com/uc?export=download');
		expect(url).toContain('abc123');
	});

	it('getProxyUrl returns our server proxy URL', () => {
		expect(getProxyUrl('abc123')).toBe('/api/file/abc123');
	});
});

describe('isGoogleDoc', () => {
	it('detects Google Docs types', () => {
		expect(isGoogleDoc('application/vnd.google-apps.document')).toBe(true);
		expect(isGoogleDoc('application/vnd.google-apps.spreadsheet')).toBe(true);
		expect(isGoogleDoc('application/vnd.google-apps.presentation')).toBe(true);
	});

	it('rejects non-Google types', () => {
		expect(isGoogleDoc('text/plain')).toBe(false);
	});
});
