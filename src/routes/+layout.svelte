<script lang="ts">
	import DonateBanner from '$lib/components/donate-banner.svelte';
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<title>driveTree</title>
	<meta name="description" content="Turn any public Google Drive folder into a browsable, downloadable file view" />
</svelte:head>

<div class="app">
	<DonateBanner />
	{@render children()}
</div>

<style>
	:root {
		/* Backgrounds */
		--color-bg-primary: #0a0e14;
		--color-bg-secondary: #12171e;
		--color-bg-tertiary: #1a2030;
		--color-bg-input: #0e1219;
		--color-bg-hover: rgba(88, 166, 255, 0.06);

		/* Borders */
		--color-border-primary: #1e2a3a;
		--color-border-secondary: #161d28;

		/* Text */
		--color-text-primary: #e2e8f0;
		--color-text-secondary: #8494a7;
		--color-text-tertiary: #4a5568;
		--color-text-link: #60a5fa;

		/* Semantic */
		--color-accent: #60a5fa;
		--color-accent-dim: rgba(96, 165, 250, 0.12);
		--color-success: #22c55e;
		--color-success-hover: #16a34a;
		--color-danger: #f87171;
		--color-warning: #f59e0b;
		--color-warning-bg: #1c1305;

		/* Spacing */
		--space-1: 4px;
		--space-2: 8px;
		--space-3: 12px;
		--space-4: 16px;
		--space-5: 20px;
		--space-6: 24px;
		--space-8: 32px;
		--space-10: 40px;
		--space-12: 48px;

		/* Radii */
		--radius-sm: 6px;
		--radius-md: 8px;
		--radius-lg: 12px;
		--radius-xl: 16px;

		/* Typography */
		--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;

		--text-xs: 0.75rem;
		--text-sm: 0.8125rem;
		--text-base: 0.9375rem;
		--text-lg: 1.125rem;
		--text-xl: 1.5rem;
		--text-2xl: 2rem;
		--text-3xl: 2.75rem;
		--text-4xl: 3.5rem;

		--leading-tight: 1.2;
		--leading-normal: 1.5;

		/* Transitions */
		--transition-fast: 0.12s ease;
		--transition-normal: 0.2s ease;

		/* Tree */
		--tree-indent: 24px;
		--tree-row-height: 34px;
	}

	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: var(--font-sans);
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		line-height: var(--leading-normal);
		font-size: var(--text-base);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(a) {
		color: var(--color-text-link);
		text-decoration: none;
		transition: color var(--transition-fast);
	}
	:global(a:hover) {
		color: #93c5fd;
	}

	:global(:focus-visible) {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
	:global(:focus:not(:focus-visible)) {
		outline: none;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(*, *::before, *::after) {
			animation-duration: 0.01ms !important;
			transition-duration: 0.01ms !important;
		}
	}

	@media (max-width: 640px) {
		:root {
			--tree-indent: 14px;
			--tree-row-height: 44px;
			--text-3xl: 2rem;
		}
	}

	@media (min-width: 641px) and (max-width: 1024px) {
		:root {
			--tree-indent: 18px;
			--tree-row-height: 38px;
		}
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	:global(.sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
