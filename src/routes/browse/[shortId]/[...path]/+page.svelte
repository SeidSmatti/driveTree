<script lang="ts">
	import { goto } from '$app/navigation';
	import FileTree from '$lib/components/file-tree.svelte';
	import FileViewer from '$lib/components/file-viewer.svelte';
	import SkeletonTree from '$lib/components/skeleton-tree.svelte';
	import StaleWarning from '$lib/components/stale-warning.svelte';
	import ZipDownload from '$lib/components/zip-download.svelte';
	import { treeStore } from '$lib/stores/tree';
	import { onMount } from 'svelte';
	import type { FileNode } from '$lib/drive/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let rootNodes = $derived($treeStore.nodes.get(data.folderId) ?? []);
	let isLoadingRoot = $derived($treeStore.loading.has(data.folderId));

	let selectedFile = $state<FileNode | null>(null);
	let showStaleWarning = $state(true);
	let staleWarning = $derived($treeStore.staleWarning);
	let folderName = $derived($treeStore.folderName);

	onMount(() => {
		treeStore.reset();
		treeStore.loadFolder(data.folderId);
	});

	function handleNavigate(path: string, _folderId: string) {
		selectedFile = null;
		goto(`/browse/${data.shortId}/${path}`, { replaceState: false });
	}

	function handleFileSelect(file: FileNode) {
		selectedFile = file;
	}

	let shareUrl = $derived(
		typeof window !== 'undefined'
			? window.location.origin + `/browse/${data.shortId}`
			: `/browse/${data.shortId}`
	);

	let copied = $state(false);

	async function copyUrl() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch {
			// clipboard not available
		}
	}

	let pathSegments = $derived(data.path ? data.path.split('/') : []);
</script>

<svelte:head>
	{#if folderName}
		<title>{folderName} — driveTree</title>
		<meta property="og:title" content="{folderName} — driveTree" />
	{:else}
		<title>driveTree</title>
	{/if}
	<meta property="og:description" content="Browse {rootNodes.length} files in this Google Drive folder" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={shareUrl} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<header>
	<div class="header-content">
		<div class="logo-group">
			<a href="/" class="logo"><span class="logo-drive">drive</span><span class="logo-tree">Tree</span></a>
			{#if folderName}
				<span class="logo-sep">/</span>
				<span class="folder-name">{folderName}</span>
			{/if}
		</div>
		<div class="header-actions">
			<div class="share-bar">
				<code class="share-url">{shareUrl}</code>
				<button class="action-btn" onclick={copyUrl}>
					{copied ? 'Copied!' : 'Copy link'}
				</button>
			</div>
			{#if rootNodes.length > 0}
				<ZipDownload nodes={rootNodes} folderName={folderName || data.shortId} />
			{/if}
		</div>
	</div>
</header>

<main>
	{#if staleWarning && showStaleWarning}
		<StaleWarning cachedAt={staleWarning.cachedAt} onDismiss={() => showStaleWarning = false} />
	{/if}

	{#if pathSegments.length > 0}
		<nav class="breadcrumbs" aria-label="Folder path">
			<a href="/browse/{data.shortId}">root</a>
			{#each pathSegments as segment, i}
				<span class="sep" aria-hidden="true">/</span>
				{#if i < pathSegments.length - 1}
					<a href="/browse/{data.shortId}/{pathSegments.slice(0, i + 1).join('/')}">{segment}</a>
				{:else}
					<span class="current" aria-current="page">{segment}</span>
				{/if}
			{/each}
		</nav>
	{/if}

	{#if isLoadingRoot}
		<SkeletonTree />
	{:else if rootNodes.length > 0}
		<FileTree
			nodes={rootNodes}
			selectedFileId={selectedFile?.id ?? ''}
			onNavigate={handleNavigate}
			onFileSelect={handleFileSelect}
		/>

		{#if selectedFile}
			{#key selectedFile.id}
				<FileViewer file={selectedFile} />
			{/key}
		{:else}
			<div class="select-prompt">
				<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"/></svg>
				Select a file to preview its contents
			</div>
		{/if}
	{:else if $treeStore.error}
		<div class="error-state">
			<div class="error-icon">
				<svg width="48" height="48" viewBox="0 0 16 16" fill="var(--color-text-tertiary)"><path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7H1.75z"/></svg>
			</div>
			<h2>Failed to load folder</h2>
			<p>{$treeStore.error}</p>
			<p class="hint">Make sure the Google Drive folder is set to "Anyone with the link can view".</p>
			<a href="/" class="back-link">Try another link</a>
		</div>
	{:else}
		<div class="empty-state">
			<p>This folder appears to be empty.</p>
		</div>
	{/if}
</main>

<style>
	header {
		border-bottom: 1px solid var(--color-border-primary);
		background: var(--color-bg-secondary);
		padding: var(--space-3) var(--space-4);
	}

	.header-content {
		max-width: 960px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}

	.logo-group {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.logo {
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--color-text-primary);
		flex-shrink: 0;
	}
	.logo:hover {
		text-decoration: none;
	}
	.logo-drive {
		color: var(--color-text-primary);
	}
	.logo-tree {
		color: var(--color-text-link);
	}

	.logo-sep {
		color: var(--color-text-tertiary);
		font-size: var(--text-lg);
	}

	.folder-name {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
		flex-wrap: wrap;
	}

	.share-bar {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.share-url {
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		background: var(--color-bg-primary);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-primary);
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.action-btn {
		font-size: var(--text-xs);
		font-family: var(--font-sans);
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		cursor: pointer;
		white-space: nowrap;
		transition: background var(--transition-fast);
	}
	.action-btn:hover {
		background: var(--color-bg-tertiary);
	}

	main {
		max-width: 960px;
		margin: var(--space-4) auto;
		padding: 0 var(--space-4);
	}

	.breadcrumbs {
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
		font-family: var(--font-mono);
		overflow-x: auto;
		white-space: nowrap;
		padding: var(--space-2) 0;
		position: sticky;
		top: 0;
		z-index: 10;
		background: var(--color-bg-primary);
	}

	.sep {
		color: var(--color-text-tertiary);
		margin: 0 2px;
	}

	.current {
		color: var(--color-text-primary);
		font-weight: 600;
	}

	.error-state, .empty-state {
		text-align: center;
		padding: var(--space-12) var(--space-4);
		color: var(--color-text-secondary);
	}

	.error-icon {
		margin-bottom: var(--space-4);
		opacity: 0.5;
	}

	.error-state h2 {
		color: var(--color-danger);
		margin-bottom: var(--space-2);
		font-size: var(--text-xl);
	}

	.hint {
		margin-top: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-tertiary);
	}

	.back-link {
		display: inline-block;
		margin-top: var(--space-4);
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		transition: background var(--transition-fast);
	}
	.back-link:hover {
		background: var(--color-bg-tertiary);
		text-decoration: none;
	}

	.select-prompt {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-8);
		color: var(--color-text-tertiary);
		font-size: var(--text-sm);
		border: 1px dashed var(--color-border-secondary);
		border-radius: var(--radius-md);
		margin-top: var(--space-4);
	}

	@media (max-width: 640px) {
		.share-url {
			display: none;
		}
		.header-content {
			gap: var(--space-2);
		}
		main {
			padding: 0 var(--space-3);
		}
	}
</style>
