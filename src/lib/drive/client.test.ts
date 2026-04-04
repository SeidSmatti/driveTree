import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listFolder, DriveError } from './client';

function mockResponse(body: object, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('listFolder', () => {
	it('fetches folder contents from our server API', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce(
			mockResponse({
				files: [
					{ id: 'f1', name: 'src', mimeType: 'application/vnd.google-apps.folder', size: 0, modifiedTime: '', isFolder: true, children: null },
					{ id: 'f2', name: 'readme.md', mimeType: 'text/markdown', size: 1024, modifiedTime: '2024-01-01T00:00:00Z', isFolder: false, children: [] }
				],
				cached: false,
				cachedAt: '2024-01-01T00:00:00Z'
			})
		);

		const result = await listFolder('folder123', mockFetch);

		expect(result.files).toHaveLength(2);
		expect(result.files[0].name).toBe('src');
		expect(result.files[1].name).toBe('readme.md');
		expect(result.cached).toBe(false);
		expect(mockFetch).toHaveBeenCalledWith('/api/folder/folder123');
	});

	it('returns stale metadata when present', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce(
			mockResponse({
				files: [],
				cached: true,
				cachedAt: '2024-01-01T00:00:00Z',
				stale: true,
				warning: 'Showing cached data'
			})
		);

		const result = await listFolder('folder123', mockFetch);
		expect(result.stale).toBe(true);
		expect(result.warning).toContain('cached');
	});

	it('throws DriveError on non-ok response', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce(
			mockResponse({ error: 'Folder not found' }, 422)
		);

		await expect(listFolder('bad-id', mockFetch)).rejects.toThrow(DriveError);
		await expect(listFolder('bad-id', mockFetch.mockResolvedValueOnce(
			mockResponse({ error: 'Folder not found' }, 422)
		))).rejects.toThrow('Folder not found');
	});

	it('encodes folder ID in URL', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce(
			mockResponse({ files: [], cached: false, cachedAt: '' })
		);

		await listFolder('folder-with-special_chars', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/folder/folder-with-special_chars');
	});
});
