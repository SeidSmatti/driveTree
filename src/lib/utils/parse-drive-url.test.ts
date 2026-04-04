import { describe, it, expect } from 'vitest';
import { parseDriveUrl } from './parse-drive-url';

describe('parseDriveUrl', () => {
	it('extracts ID from standard folder URL', () => {
		const result = parseDriveUrl('https://drive.google.com/drive/folders/1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(result).toEqual({ folderId: '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk' });
	});

	it('extracts ID from URL with sharing param', () => {
		const result = parseDriveUrl('https://drive.google.com/drive/folders/1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk?usp=sharing');
		expect(result).toEqual({ folderId: '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk' });
	});

	it('extracts ID from URL with user index', () => {
		const result = parseDriveUrl('https://drive.google.com/drive/u/0/folders/1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(result).toEqual({ folderId: '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk' });
	});

	it('extracts ID from open?id= format', () => {
		const result = parseDriveUrl('https://drive.google.com/open?id=1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(result).toEqual({ folderId: '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk' });
	});

	it('accepts a raw folder ID', () => {
		const result = parseDriveUrl('1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk');
		expect(result).toEqual({ folderId: '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk' });
	});

	it('trims whitespace', () => {
		const result = parseDriveUrl('  1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk  ');
		expect(result).toEqual({ folderId: '1gmVxsOkA87uwH8Q95-6D-ApTs1VeijNk' });
	});

	it('rejects empty input', () => {
		const result = parseDriveUrl('');
		expect(result).toHaveProperty('error');
	});

	it('rejects random text', () => {
		const result = parseDriveUrl('hello world');
		expect(result).toHaveProperty('error');
	});

	it('rejects Google Docs URL', () => {
		const result = parseDriveUrl('https://docs.google.com/document/d/abc123/edit');
		expect(result).toHaveProperty('error');
	});

	it('rejects short strings as raw IDs', () => {
		const result = parseDriveUrl('abc');
		expect(result).toHaveProperty('error');
	});

	it('rejects URLs with special characters', () => {
		const result = parseDriveUrl('https://drive.google.com/drive/folders/<script>');
		expect(result).toHaveProperty('error');
	});
});
