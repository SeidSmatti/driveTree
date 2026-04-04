declare global {
	namespace App {
		interface Platform {
			env?: {
				LINKS_KV: KVNamespace;
				META_KV: KVNamespace;
			};
		}
	}
}

export {};
