<script lang="ts">
	import type { FileNode } from '$lib/drive/types';
	import FileTreeItem from './file-tree-item.svelte';
	import { treeStore } from '$lib/stores/tree';

	let {
		nodes,
		basePath = '',
		selectedFileId = '',
		onNavigate,
		onFileSelect
	}: {
		nodes: FileNode[];
		basePath?: string;
		selectedFileId?: string;
		onNavigate: (path: string, folderId: string) => void;
		onFileSelect: (file: FileNode) => void;
	} = $props();

	let focusedId = $state(nodes.length > 0 ? nodes[0].id : '');

	// Build flat list of visible node IDs for arrow key navigation
	function getVisibleIds(items: FileNode[]): string[] {
		const ids: string[] = [];
		for (const item of items) {
			ids.push(item.id);
			if (item.isFolder && $treeStore.expanded.has(item.id)) {
				const children = $treeStore.nodes.get(item.id) ?? [];
				ids.push(...getVisibleIds(children));
			}
		}
		return ids;
	}

	function handleFocusMove(direction: string, nodeId: string) {
		const visible = getVisibleIds(nodes);
		const idx = visible.indexOf(nodeId);
		if (idx === -1) return;

		switch (direction) {
			case 'down':
				if (idx < visible.length - 1) focusedId = visible[idx + 1];
				break;
			case 'up':
				if (idx > 0) focusedId = visible[idx - 1];
				break;
			case 'left':
				// Move to parent — find the item before current that has smaller depth
				if (idx > 0) focusedId = visible[idx - 1];
				break;
			case 'home':
				focusedId = visible[0];
				break;
			case 'end':
				focusedId = visible[visible.length - 1];
				break;
		}
	}

	let folderCount = $derived(nodes.filter(n => n.isFolder).length);
	let fileCount = $derived(nodes.filter(n => !n.isFolder).length);
</script>

<div class="tree-header">
	<span class="tree-count">
		{nodes.length} items{#if folderCount > 0} &middot; {folderCount} folder{folderCount !== 1 ? 's' : ''}{/if}{#if fileCount > 0} &middot; {fileCount} file{fileCount !== 1 ? 's' : ''}{/if}
	</span>
</div>

<ul class="tree" role="tree" aria-label="File tree">
	{#each nodes as node (node.id)}
		<FileTreeItem
			{node}
			depth={0}
			{basePath}
			{selectedFileId}
			focused={focusedId === node.id}
			{onNavigate}
			{onFileSelect}
			onFocusMove={handleFocusMove}
		/>
	{/each}
</ul>

{#if $treeStore.error}
	<div class="error-banner" role="alert">
		{$treeStore.error}
	</div>
{/if}

<style>
	.tree-header {
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-primary);
		border-bottom: none;
		border-radius: var(--radius-md) var(--radius-md) 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.tree {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--color-border-primary);
		border-top: 1px solid var(--color-border-secondary);
		border-radius: 0 0 var(--radius-md) var(--radius-md);
		overflow: hidden;
		background: var(--color-bg-primary);
	}

	.error-banner {
		margin-top: var(--space-4);
		padding: var(--space-3) var(--space-4);
		background: #3d1f1f;
		border: 1px solid var(--color-danger);
		border-radius: var(--radius-md);
		color: var(--color-danger);
		font-size: var(--text-sm);
	}
</style>
