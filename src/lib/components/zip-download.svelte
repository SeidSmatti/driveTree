<script lang="ts">
	import type { FileNode } from '$lib/drive/types';
	import { fetchFileBlob, isGoogleDoc } from '$lib/drive/content';
	import { formatSize } from '$lib/drive/icons';

	let {
		nodes,
		folderName = 'folder'
	}: {
		nodes: FileNode[];
		folderName?: string;
	} = $props();

	let state = $state<'idle' | 'confirming' | 'downloading' | 'done' | 'error'>('idle');
	let progress = $state({ done: 0, total: 0, bytes: 0 });
	let errorMessage = $state('');
	let abortController = $state<AbortController | null>(null);

	function collectFiles(items: FileNode[], path: string = ''): { path: string; node: FileNode }[] {
		const result: { path: string; node: FileNode }[] = [];
		for (const item of items) {
			const fullPath = path ? `${path}/${item.name}` : item.name;
			if (item.isFolder && item.children) {
				result.push(...collectFiles(item.children, fullPath));
			} else if (!item.isFolder && !isGoogleDoc(item.mimeType)) {
				result.push({ path: fullPath, node: item });
			}
		}
		return result;
	}

	function getPreflight() {
		const files = collectFiles(nodes);
		const totalBytes = files.reduce((sum, f) => sum + f.node.size, 0);
		const googleDocs = nodes.filter((n) => isGoogleDoc(n.mimeType));
		return { files, totalBytes, googleDocs: googleDocs.length };
	}

	function handleClick() {
		const { files, totalBytes, googleDocs } = getPreflight();

		if (files.length > 500 || totalBytes > 1024 * 1024 * 1024) {
			errorMessage = `This folder is too large to download as ZIP (${files.length} files, ${formatSize(totalBytes)}). Maximum: 500 files or 1 GB.`;
			state = 'error';
			return;
		}

		if (files.length > 200 || totalBytes > 500 * 1024 * 1024) {
			state = 'confirming';
			return;
		}

		startDownload();
	}

	async function startDownload() {
		const { files } = getPreflight();
		if (files.length === 0) {
			errorMessage = 'No downloadable files in this folder.';
			state = 'error';
			return;
		}

		state = 'downloading';
		progress = { done: 0, total: files.length, bytes: 0 };
		const controller = new AbortController();
		abortController = controller;

		try {
			// Lazy-load JSZip
			const JSZip = (await import('jszip')).default;
			const zip = new JSZip();

			// Fetch files with concurrency limit
			const CONCURRENCY = 5;
			let index = 0;

			async function fetchNext(): Promise<void> {
				while (index < files.length && !controller.signal.aborted) {
					const current = index++;
					const file = files[current];
					try {
						const blob = await fetchFileBlob(file.node.id, controller.signal);
						zip.file(file.path, blob);
						progress.bytes += file.node.size;
					} catch (e) {
						if (controller.signal.aborted) return;
						// Skip failed files, continue
					}
					progress.done++;
					progress = progress; // trigger reactivity
				}
			}

			const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, () => fetchNext());
			await Promise.all(workers);

			if (controller.signal.aborted) return;

			// Generate zip
			const blob = await zip.generateAsync({ type: 'blob' });

			// Try File System Access API first, then fallback
			if ('showSaveFilePicker' in window) {
				try {
					const handle = await (window as any).showSaveFilePicker({
						suggestedName: `${folderName}.zip`,
						types: [{ description: 'ZIP archive', accept: { 'application/zip': ['.zip'] } }]
					});
					const writable = await handle.createWritable();
					await writable.write(blob);
					await writable.close();
					state = 'done';
					return;
				} catch {
					// User cancelled or API unavailable — fallback below
				}
			}

			// Fallback: blob download
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${folderName}.zip`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			state = 'done';
		} catch (e) {
			if (controller.signal.aborted) {
				state = 'idle';
				return;
			}
			errorMessage = e instanceof Error ? e.message : 'Download failed';
			state = 'error';
		} finally {
			abortController = null;
		}
	}

	function handleCancel() {
		abortController?.abort();
		state = 'idle';
	}
</script>

{#if state === 'idle'}
	<button class="zip-btn" onclick={handleClick}>
		<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1.75v11.5c0 .09.048.173.126.217a.25.25 0 00.249.008l4.125-2.063 4.125 2.063a.25.25 0 00.375-.217V1.75A1.75 1.75 0 0010.75 0H5.25A1.75 1.75 0 003.5 1.75z"/></svg>
		Download ZIP
	</button>
{:else if state === 'confirming'}
	{@const info = getPreflight()}
	<div class="confirm-bar">
		<span>Download {info.files.length} files ({formatSize(info.totalBytes)}) as ZIP?</span>
		<button class="zip-btn small" onclick={startDownload}>Yes, download</button>
		<button class="cancel-btn" onclick={() => state = 'idle'}>Cancel</button>
	</div>
{:else if state === 'downloading'}
	<div class="progress-bar">
		<div class="progress-track">
			<div class="progress-fill" style:width="{progress.total > 0 ? (progress.done / progress.total * 100) : 0}%"></div>
		</div>
		<span class="progress-text">{progress.done}/{progress.total} files ({formatSize(progress.bytes)})</span>
		<button class="cancel-btn" onclick={handleCancel}>Cancel</button>
	</div>
{:else if state === 'done'}
	<div class="done-bar">
		<span>ZIP downloaded successfully.</span>
		<button class="zip-btn small" onclick={() => state = 'idle'}>Done</button>
	</div>
{:else if state === 'error'}
	<div class="error-bar" role="alert">
		<span>{errorMessage}</span>
		<button class="cancel-btn" onclick={() => state = 'idle'}>Dismiss</button>
	</div>
{/if}

<style>
	.zip-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		font-family: var(--font-sans);
		cursor: pointer;
		transition: background var(--transition-fast);
	}
	.zip-btn:hover { background: var(--color-bg-tertiary); }
	.zip-btn.small { font-size: var(--text-xs); padding: var(--space-1) var(--space-2); }

	.cancel-btn {
		padding: var(--space-1) var(--space-2);
		border: none;
		border-radius: var(--radius-sm);
		background: none;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-family: var(--font-sans);
		cursor: pointer;
	}
	.cancel-btn:hover { color: var(--color-text-primary); }

	.confirm-bar, .progress-bar, .done-bar, .error-bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		flex-wrap: wrap;
	}

	.error-bar { color: var(--color-danger); }

	.progress-track {
		flex: 1;
		min-width: 100px;
		height: 6px;
		background: var(--color-border-secondary);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.progress-text {
		white-space: nowrap;
		font-family: var(--font-mono);
	}
</style>
