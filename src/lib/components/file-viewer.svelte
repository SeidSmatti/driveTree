<script lang="ts">
	import type { FileNode } from '$lib/drive/types';
	import { getRenderMode, getLanguageId, fetchFileText, fetchFileBlob, getDirectDownloadUrl, getProxyUrl, isGoogleDoc, getGoogleDocInfo } from '$lib/drive/content';
	import { formatSize } from '$lib/drive/icons';
	import { onMount } from 'svelte';

	let { file }: { file: FileNode } = $props();

	let rawContent = $state<string | null>(null);
	let highlightedHtml = $state<string | null>(null);
	let imageUrl = $state<string | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let copied = $state(false);
	let lineCount = $state(0);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	let renderMode = $derived(getRenderMode(file.mimeType, file.name));
	let isTooLarge = $derived(file.size > 5 * 1024 * 1024);

	onMount(() => {
		loadContent();
		return () => {
			if (imageUrl) URL.revokeObjectURL(imageUrl);
			if (copyTimer) clearTimeout(copyTimer);
		};
	});

	async function loadContent() {
		loading = true;
		error = null;
		rawContent = null;
		highlightedHtml = null;
		if (imageUrl) { URL.revokeObjectURL(imageUrl); imageUrl = null; }

		if (isTooLarge || renderMode === 'google-doc' || renderMode === 'binary') {
			loading = false;
			return;
		}

		try {
			if (renderMode === 'text') {
				const text = await fetchFileText(file.id);
				rawContent = text;
				lineCount = text.split('\n').length;

				// Lazy-load Shiki for syntax highlighting
				const lang = getLanguageId(file.name);
				if (lang !== 'text') {
					try {
						const { createHighlighter } = await import('shiki');
						const highlighter = await createHighlighter({
							themes: ['github-dark'],
							langs: [lang]
						});
						highlightedHtml = highlighter.codeToHtml(text, {
							lang,
							theme: 'github-dark'
						});
						highlighter.dispose();
					} catch {
						// Shiki failed for this language — plain text fallback
					}
				}
			} else if (renderMode === 'image') {
				const blob = await fetchFileBlob(file.id);
				imageUrl = URL.createObjectURL(blob);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load file';
		} finally {
			loading = false;
		}
	}

	async function copyContent() {
		if (!rawContent) return;
		try {
			await navigator.clipboard.writeText(rawContent);
			copied = true;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => { copied = false; }, 2000);
		} catch {
			// Clipboard not available
		}
	}
</script>

<div class="viewer">
	<!-- Header bar -->
	<div class="viewer-header">
		<span class="viewer-name">{file.name}</span>
		<div class="viewer-actions">
			{#if file.size}
				<span class="viewer-meta">{formatSize(file.size)}</span>
			{/if}
			{#if lineCount > 0}
				<span class="viewer-meta">{lineCount} lines</span>
			{/if}
			{#if rawContent !== null}
				<button class="action-btn" onclick={copyContent} title="Copy file contents">
					{#if copied}
						<svg width="14" height="14" viewBox="0 0 16 16" fill="var(--color-success)"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.751.751 0 011.042-1.08L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
						Copied
					{:else}
						<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/></svg>
						Copy
					{/if}
				</button>
			{/if}
			{#if !isGoogleDoc(file.mimeType)}
				<a class="action-btn" href={getDirectDownloadUrl(file.id)} target="_blank" rel="noopener" title="Download">
					<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z"/><path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.969a.749.749 0 111.06 1.06l-3.25 3.25a.749.749 0 01-1.06 0L4.22 6.78a.749.749 0 111.06-1.06l1.97 1.969z"/></svg>
					Download
				</a>
			{/if}
		</div>
	</div>

	<!-- Content body -->
	<div class="viewer-body">
		{#if loading}
			<div class="loading-skeleton">
				{#each Array(8) as _, i}
					<div class="skel-line" style:width="{40 + Math.random() * 50}%" style:animation-delay="{i * 0.05}s"></div>
				{/each}
			</div>
		{:else if error}
			<div class="state-message">
				<p class="error-text">{error}</p>
				<button class="action-btn primary" onclick={loadContent}>Retry</button>
			</div>
		{:else if isTooLarge}
			<div class="state-message">
				<p>File too large to preview ({formatSize(file.size)}).</p>
				<a class="action-btn primary" href={getDirectDownloadUrl(file.id)} target="_blank" rel="noopener">Download file</a>
			</div>
		{:else if renderMode === 'google-doc'}
			<div class="state-message">
				<p>{getGoogleDocInfo(file.mimeType)?.label ?? 'Google Workspace file'}</p>
				<p class="hint">Google Workspace files cannot be previewed. Open in Google Drive to view.</p>
				<a class="action-btn primary" href="https://drive.google.com/file/d/{file.id}/view" target="_blank" rel="noopener">Open in Drive</a>
			</div>
		{:else if renderMode === 'text'}
			<div class="code-container">
				{#if highlightedHtml}
					<div class="code-content highlighted line-numbered">
						{@html highlightedHtml}
					</div>
				{:else if rawContent !== null}
					<div class="code-content plain line-numbered">
						<pre><code>{rawContent}</code></pre>
					</div>
				{/if}
			</div>
		{:else if renderMode === 'image' && imageUrl}
			<div class="image-container">
				<img src={imageUrl} alt={file.name} />
			</div>
		{:else if renderMode === 'pdf'}
			<div class="pdf-container">
				<iframe src={getProxyUrl(file.id)} title={file.name}></iframe>
			</div>
		{:else}
			<div class="state-message">
				<p>Binary file — {file.mimeType}</p>
				<a class="action-btn primary" href={getDirectDownloadUrl(file.id)} target="_blank" rel="noopener">Download file</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.viewer {
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		overflow: hidden;
		margin-top: var(--space-4);
		background: var(--color-bg-primary);
	}

	/* Header */
	.viewer-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-4);
		background: var(--color-bg-secondary);
		border-bottom: 1px solid var(--color-border-primary);
		font-size: var(--text-sm);
		flex-wrap: wrap;
	}
	.viewer-name {
		font-family: var(--font-mono);
		font-weight: 600;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.viewer-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}
	.viewer-meta {
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		white-space: nowrap;
	}

	/* Action buttons */
	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		font-family: var(--font-sans);
		cursor: pointer;
		white-space: nowrap;
		transition: background var(--transition-fast);
		text-decoration: none;
		line-height: 1;
	}
	.action-btn:hover {
		background: var(--color-bg-tertiary);
		text-decoration: none;
	}
	.action-btn.primary {
		background: var(--color-success);
		border-color: var(--color-success);
		color: #fff;
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
	}
	.action-btn.primary:hover {
		background: var(--color-success-hover);
	}

	/* Code container with CSS counter line numbers */
	.code-container {
		overflow-x: auto;
		font-size: var(--text-sm);
		line-height: 1.45;
	}

	.code-content {
		min-width: 0;
		overflow-x: auto;
	}

	/* CSS counter-based line numbers — zero DOM nodes */
	.line-numbered :global(pre) {
		counter-reset: line;
	}
	.line-numbered :global(code) {
		counter-reset: line;
	}
	.line-numbered :global(.line)::before,
	.line-numbered.plain :global(code) {
		counter-increment: line;
	}
	/* Shiki wraps lines in .line spans */
	.line-numbered :global(.line)::before {
		content: counter(line);
		display: inline-block;
		width: 3.5em;
		margin-right: 1em;
		padding-right: 0.5em;
		text-align: right;
		color: var(--color-text-tertiary);
		border-right: 1px solid var(--color-border-secondary);
		user-select: none;
	}
	.code-content :global(pre) {
		margin: 0;
		padding: var(--space-4);
		background: transparent !important;
		font-family: var(--font-mono);
		line-height: 1.45;
		tab-size: 4;
	}
	.code-content :global(code) {
		font-family: var(--font-mono);
	}
	.code-content :global(.shiki) {
		background: transparent !important;
	}
	.code-content.plain pre {
		color: var(--color-text-primary);
	}

	/* Image */
	.image-container {
		display: flex;
		justify-content: center;
		padding: var(--space-6);
		background: var(--color-bg-primary);
	}
	.image-container img {
		max-width: 100%;
		max-height: 600px;
		height: auto;
		border-radius: var(--radius-sm);
	}

	/* PDF */
	.pdf-container iframe {
		width: 100%;
		height: 600px;
		border: none;
		display: block;
	}

	/* State messages */
	.state-message {
		padding: var(--space-10);
		text-align: center;
		color: var(--color-text-secondary);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}
	.error-text {
		color: var(--color-danger);
	}
	.hint {
		font-size: var(--text-sm);
		color: var(--color-text-tertiary);
	}

	/* Loading skeleton */
	.loading-skeleton {
		padding: var(--space-6) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.skel-line {
		height: 14px;
		border-radius: 3px;
		background: var(--color-border-secondary);
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.6; }
	}

	@media (max-width: 640px) {
		.viewer-header {
			padding: var(--space-2) var(--space-3);
		}
		.viewer-meta {
			display: none;
		}
		.line-numbers {
			display: none;
		}
	}
</style>
