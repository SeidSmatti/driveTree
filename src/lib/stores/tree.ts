import { writable, get } from 'svelte/store';
import { listFolder, type FolderResult } from '$lib/drive/client';
import type { FileNode } from '$lib/drive/types';

interface TreeState {
	nodes: Map<string, FileNode[]>;
	loading: Set<string>;
	expanded: Set<string>;
	error: string | null;
	staleWarning: { cachedAt: string } | null;
	folderName: string;
}

function createTreeStore() {
	const { subscribe, update } = writable<TreeState>({
		nodes: new Map(),
		loading: new Set(),
		expanded: new Set(),
		error: null,
		staleWarning: null,
		folderName: ''
	});

	return {
		subscribe,

		async loadFolder(folderId: string) {
			const state = get({ subscribe });
			if (state.nodes.has(folderId) || state.loading.has(folderId)) return;

			update((s) => {
				s.loading.add(folderId);
				s.error = null;
				return s;
			});

			try {
				const result = await listFolder(folderId);
				update((s) => {
					s.nodes.set(folderId, result.files);
					s.loading.delete(folderId);
					if (result.folderName && !s.folderName) {
						s.folderName = result.folderName;
					}
					if (result.stale && result.cachedAt) {
						s.staleWarning = { cachedAt: result.cachedAt };
					}
					return s;
				});
			} catch (e) {
				update((s) => {
					s.loading.delete(folderId);
					s.error = e instanceof Error ? e.message : 'Failed to load folder';
					return s;
				});
			}
		},

		async toggleFolder(folderId: string) {
			const state = get({ subscribe });
			if (state.expanded.has(folderId)) {
				update((s) => {
					s.expanded.delete(folderId);
					return s;
				});
			} else {
				update((s) => {
					s.expanded.add(folderId);
					return s;
				});
				if (!state.nodes.has(folderId)) {
					await this.loadFolder(folderId);
				}
			}
		},

		reset() {
			update(() => ({
				nodes: new Map(),
				loading: new Set(),
				expanded: new Set(),
				error: null,
				staleWarning: null,
				folderName: ''
			}));
		}
	};
}

export const treeStore = createTreeStore();
