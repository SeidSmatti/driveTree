<script lang="ts">
	import type { FileNode } from '$lib/drive/types';
	import { getFileIcon, formatSize, formatDate } from '$lib/drive/icons';
	import { getDirectDownloadUrl, isGoogleDoc } from '$lib/drive/content';
	import { treeStore } from '$lib/stores/tree';

	let {
		node,
		depth = 0,
		basePath,
		selectedFileId = '',
		focused = false,
		onNavigate,
		onFileSelect,
		onFocusMove
	}: {
		node: FileNode;
		depth?: number;
		basePath: string;
		selectedFileId?: string;
		focused?: boolean;
		onNavigate: (path: string, folderId: string) => void;
		onFileSelect: (file: FileNode) => void;
		onFocusMove?: (direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end', nodeId: string) => void;
	} = $props();

	let isExpanded = $derived($treeStore.expanded.has(node.id));
	let isLoading = $derived($treeStore.loading.has(node.id));
	let children = $derived($treeStore.nodes.get(node.id) ?? []);
	let isSelected = $derived(node.id === selectedFileId);
	let canDownload = $derived(!node.isFolder && !isGoogleDoc(node.mimeType));
	let itemEl: HTMLElement | undefined = $state();

	$effect(() => {
		if (focused && itemEl) {
			itemEl.focus();
		}
	});

	function handleClick() {
		if (node.isFolder) {
			const path = basePath ? `${basePath}/${node.name}` : node.name;
			onNavigate(path, node.id);
			treeStore.toggleFolder(node.id);
		} else {
			onFileSelect(node);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Enter':
			case ' ':
				e.preventDefault();
				handleClick();
				break;
			case 'ArrowDown':
				e.preventDefault();
				onFocusMove?.('down', node.id);
				break;
			case 'ArrowUp':
				e.preventDefault();
				onFocusMove?.('up', node.id);
				break;
			case 'ArrowRight':
				e.preventDefault();
				if (node.isFolder && !isExpanded) {
					treeStore.toggleFolder(node.id);
				} else {
					onFocusMove?.('down', node.id); // move to first child
				}
				break;
			case 'ArrowLeft':
				e.preventDefault();
				if (node.isFolder && isExpanded) {
					treeStore.toggleFolder(node.id);
				} else {
					onFocusMove?.('left', node.id); // move to parent
				}
				break;
			case 'Home':
				e.preventDefault();
				onFocusMove?.('home', node.id);
				break;
			case 'End':
				e.preventDefault();
				onFocusMove?.('end', node.id);
				break;
		}
	}

	function handleDownloadClick(e: MouseEvent) {
		e.stopPropagation();
	}
</script>

<li
	bind:this={itemEl}
	class="item"
	class:folder={node.isFolder}
	class:file={!node.isFolder}
	class:selected={isSelected}
	style:padding-left="calc({depth} * var(--tree-indent) + var(--space-3))"
	onclick={handleClick}
	onkeydown={handleKeydown}
	role="treeitem"
	aria-expanded={node.isFolder ? isExpanded : undefined}
	aria-level={depth + 1}
	aria-selected={isSelected}
	tabindex={focused ? 0 : -1}
>
	<span class="chevron-slot" aria-hidden="true">
		{#if node.isFolder}
			{#if isLoading}
				<span class="spinner"></span>
			{:else}
				<span class="chevron" class:expanded={isExpanded}>&#9656;</span>
			{/if}
		{/if}
	</span>
	<span class="icon" aria-hidden="true">
		{@html getFileIcon(node.mimeType, node.name)}
	</span>
	<span class="name">{node.name}</span>
	<span class="meta">
		{#if !node.isFolder && node.size}
			<span class="size">{formatSize(node.size)}</span>
		{/if}
		{#if node.modifiedTime}
			<span class="date" title={new Date(node.modifiedTime).toLocaleString()}>{formatDate(node.modifiedTime)}</span>
		{/if}
	</span>
	{#if canDownload}
		<a
			class="row-download"
			href={getDirectDownloadUrl(node.id)}
			target="_blank"
			rel="noopener"
			title="Download {node.name}"
			onclick={handleDownloadClick}
			aria-label="Download {node.name}"
			tabindex={-1}
		>
			<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z"/><path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.969a.749.749 0 111.06 1.06l-3.25 3.25a.749.749 0 01-1.06 0L4.22 6.78a.749.749 0 111.06-1.06l1.97 1.969z"/></svg>
		</a>
	{/if}
</li>

{#if node.isFolder && isExpanded}
	<ul role="group" class="subtree">
		{#each children as child (child.id)}
			<svelte:self
				node={child}
				depth={depth + 1}
				basePath={basePath ? `${basePath}/${node.name}` : node.name}
				{selectedFileId}
				{onNavigate}
				{onFileSelect}
				{onFocusMove}
			/>
		{/each}
		{#if !isLoading && children.length === 0 && $treeStore.nodes.has(node.id)}
			<li class="empty" style:padding-left="calc({depth + 1} * var(--tree-indent) + var(--space-3))" role="none">
				Empty folder
			</li>
		{/if}
	</ul>
{/if}

<style>
	.item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--tree-row-height);
		padding-right: var(--space-3);
		cursor: default;
		border-bottom: 1px solid var(--color-border-secondary);
		border-left: 2px solid transparent;
		font-size: var(--text-sm);
		user-select: none;
		transition: background var(--transition-fast);
		list-style: none;
	}

	.item.folder, .item.file {
		cursor: pointer;
	}

	.item:hover {
		background: var(--color-bg-tertiary);
	}

	.item:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	.item.selected {
		background: var(--color-bg-tertiary);
		border-left-color: var(--color-accent);
	}
	.item.selected .name {
		color: var(--color-text-link);
	}

	.chevron-slot {
		width: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.chevron {
		display: inline-block;
		font-size: 0.65rem;
		transition: transform var(--transition-fast);
		color: var(--color-text-secondary);
		line-height: 1;
	}
	.chevron.expanded {
		transform: rotate(90deg);
	}

	.icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		color: var(--color-text-secondary);
	}

	.name {
		flex: 1;
		font-family: var(--font-mono);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-shrink: 0;
	}

	.size {
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		min-width: 50px;
		text-align: right;
	}

	.date {
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		min-width: 60px;
		text-align: right;
	}

	.row-download {
		display: none;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		transition: background var(--transition-fast), color var(--transition-fast);
		flex-shrink: 0;
		text-decoration: none;
	}
	.row-download:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		text-decoration: none;
	}
	.item:hover .row-download {
		display: flex;
	}

	.subtree {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.empty {
		color: var(--color-text-tertiary);
		font-size: var(--text-sm);
		font-style: italic;
		min-height: var(--tree-row-height);
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--color-border-secondary);
		list-style: none;
	}

	.spinner {
		display: inline-block;
		width: 10px;
		height: 10px;
		border: 2px solid var(--color-border-primary);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Mobile: always show download button (no hover on touch) */
	@media (max-width: 640px) {
		.row-download {
			display: flex;
		}
		.date { display: none; }
	}

	@media (max-width: 400px) {
		.meta { display: none; }
	}
</style>
