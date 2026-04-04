import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the env module before importing the module under test
vi.mock('$env/static/private', () => ({
	GOOGLE_DRIVE_API_KEY: 'test-api-key-123'
}));

// Import after mock is set up
const { listDriveFolder, getDriveFileContent, DriveApiError } = await import('./drive-api');

function mockJsonResponse(body: object, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('listDriveFolder', () => {
	it('fetches folder name and file listing', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch')
			// First call: folder metadata (name)
			.mockResolvedValueOnce(mockJsonResponse({ name: 'my-project' }))
			// Second call: file listing
			.mockResolvedValueOnce(mockJsonResponse({
				files: [
					{ id: 'f1', name: 'src', mimeType: 'application/vnd.google-apps.folder' },
					{ id: 'f2', name: 'README.md', mimeType: 'text/markdown', size: '1024', modifiedTime: '2024-01-01T00:00:00Z' }
				]
			}));

		const result = await listDriveFolder('folder123');

		expect(result.folderName).toBe('my-project');
		expect(result.files).toHaveLength(2);
		expect(result.files[0].name).toBe('src');
		expect(result.files[0].isFolder).toBe(true);
		expect(result.files[1].name).toBe('README.md');
		expect(result.files[1].size).toBe(1024);

		// Verify API key is included in requests
		const urls = fetchSpy.mock.calls.map(c => String(c[0]));
		expect(urls.every(u => u.includes('key=test-api-key-123'))).toBe(true);
	});

	it('handles pagination', async () => {
		vi.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(mockJsonResponse({ name: 'project' }))
			.mockResolvedValueOnce(mockJsonResponse({
				files: [{ id: 'f1', name: 'a.txt', mimeType: 'text/plain' }],
				nextPageToken: 'page2'
			}))
			.mockResolvedValueOnce(mockJsonResponse({
				files: [{ id: 'f2', name: 'b.txt', mimeType: 'text/plain' }]
			}));

		const result = await listDriveFolder('folder123');
		expect(result.files).toHaveLength(2);
	});

	it('sorts folders before files', async () => {
		vi.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(mockJsonResponse({ name: 'project' }))
			.mockResolvedValueOnce(mockJsonResponse({
				files: [
					{ id: 'f1', name: 'zebra.txt', mimeType: 'text/plain' },
					{ id: 'f2', name: 'docs', mimeType: 'application/vnd.google-apps.folder' },
					{ id: 'f3', name: 'alpha.txt', mimeType: 'text/plain' }
				]
			}));

		const result = await listDriveFolder('folder123');
		expect(result.files.map(f => f.name)).toEqual(['docs', 'alpha.txt', 'zebra.txt']);
	});

	it('throws DriveApiError on 404', async () => {
		vi.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(mockJsonResponse({ name: '' }))
			.mockResolvedValueOnce(mockJsonResponse({ error: { message: 'Not found' } }, 404));

		await expect(listDriveFolder('bad-id')).rejects.toThrow('Folder not found');
	});

	it('throws DriveApiError on 403', async () => {
		vi.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(mockJsonResponse({ name: '' }))
			.mockResolvedValueOnce(mockJsonResponse({ error: { message: 'Forbidden' } }, 403));

		await expect(listDriveFolder('private-folder')).rejects.toThrow('not public');
	});
});

describe('getDriveFileContent', () => {
	it('returns the response for streaming', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response('file content here', {
				status: 200,
				headers: { 'Content-Type': 'text/plain', 'Content-Length': '17' }
			})
		);

		const res = await getDriveFileContent('file123');
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toBe('file content here');
	});

	it('throws on non-ok response', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			mockJsonResponse({ error: { message: 'Not found' } }, 404)
		);

		await expect(getDriveFileContent('bad-id')).rejects.toThrow(DriveApiError);
	});
});
