import { describe, it, expect } from 'vitest';
import { getFileIcon, formatSize, formatDate } from './icons';

describe('getFileIcon', () => {
	it('returns folder SVG for folder MIME type', () => {
		const icon = getFileIcon('application/vnd.google-apps.folder');
		expect(icon).toContain('<svg');
		expect(icon).toContain('d29922'); // folder gold color
	});

	it('returns PDF SVG for PDF type', () => {
		const icon = getFileIcon('application/pdf');
		expect(icon).toContain('<svg');
		expect(icon).toContain('f85149'); // red color
	});

	it('returns image SVG for image types', () => {
		expect(getFileIcon('image/png')).toContain('<svg');
		expect(getFileIcon('image/jpeg')).toContain('<svg');
	});

	it('returns code SVG for code file extensions', () => {
		const icon = getFileIcon('text/plain', 'main.py');
		expect(icon).toContain('<svg');
		// Code icon has the angle bracket paths
		expect(icon).toContain('3.22');
	});

	it('returns data SVG for JSON/YAML', () => {
		const icon = getFileIcon('application/json', 'config.json');
		expect(icon).toContain('<svg');
	});

	it('returns archive SVG for zip files', () => {
		const icon = getFileIcon('application/zip', 'archive.zip');
		expect(icon).toContain('<svg');
	});

	it('returns generic file SVG for unknown types', () => {
		const icon = getFileIcon('application/octet-stream');
		expect(icon).toContain('<svg');
	});
});

describe('formatSize', () => {
	it('returns empty string for 0 bytes', () => {
		expect(formatSize(0)).toBe('');
	});

	it('formats bytes', () => {
		expect(formatSize(512)).toBe('512 B');
	});

	it('formats kilobytes', () => {
		expect(formatSize(1024)).toBe('1.0 KB');
		expect(formatSize(1536)).toBe('1.5 KB');
	});

	it('formats megabytes', () => {
		expect(formatSize(1048576)).toBe('1.0 MB');
	});

	it('formats large values without decimals', () => {
		expect(formatSize(100 * 1048576)).toBe('100 MB');
	});

	it('formats gigabytes', () => {
		expect(formatSize(1073741824)).toBe('1.0 GB');
	});
});

describe('formatDate', () => {
	it('returns empty for empty string', () => {
		expect(formatDate('')).toBe('');
	});

	it('returns "just now" for recent dates', () => {
		const now = new Date().toISOString();
		expect(formatDate(now)).toBe('just now');
	});

	it('returns relative hours', () => {
		const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
		expect(formatDate(twoHoursAgo)).toBe('2h ago');
	});

	it('returns "yesterday" for 24-48h old', () => {
		const yesterday = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
		expect(formatDate(yesterday)).toBe('yesterday');
	});

	it('returns relative days for recent dates', () => {
		const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
		expect(formatDate(fiveDaysAgo)).toBe('5d ago');
	});

	it('returns month/day for older dates', () => {
		const old = new Date('2024-03-15T00:00:00Z').toISOString();
		const result = formatDate(old);
		expect(result).toContain('Mar');
		expect(result).toContain('15');
	});
});
