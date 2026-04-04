/**
 * In-memory KV implementation for local development.
 * Mirrors the Cloudflare KV API surface we actually use.
 */
export class MockKV implements KVNamespace {
	private store = new Map<string, { value: string; expiration?: number }>();

	async get(key: string): Promise<string | null> {
		const entry = this.store.get(key);
		if (!entry) return null;
		if (entry.expiration && Date.now() / 1000 > entry.expiration) {
			this.store.delete(key);
			return null;
		}
		return entry.value;
	}

	async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
		const expiration = options?.expirationTtl
			? Date.now() / 1000 + options.expirationTtl
			: undefined;
		this.store.set(key, { value, expiration });
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	// Stubs for the full KVNamespace interface — unused but required for type compat
	async list(): Promise<KVNamespaceListResult<unknown, string>> {
		return { keys: [], list_complete: true, cacheStatus: null };
	}
	async getWithMetadata(): Promise<KVNamespaceGetWithMetadataResult<string, unknown>> {
		return { value: null, metadata: null, cacheStatus: null };
	}
}

const linksKV = new MockKV();
const metaKV = new MockKV();

export function getKV(platform: App.Platform | undefined) {
	return {
		links: platform?.env?.LINKS_KV ?? (linksKV as unknown as KVNamespace),
		meta: platform?.env?.META_KV ?? (metaKV as unknown as KVNamespace)
	};
}
