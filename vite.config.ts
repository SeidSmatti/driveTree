import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Isolate heavy lazy-loaded deps into their own chunks
					if (id.includes('node_modules/shiki') || id.includes('node_modules/@shikijs')) {
						return 'shiki';
					}
					if (id.includes('node_modules/jszip')) {
						return 'jszip';
					}
				}
			}
		}
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});
