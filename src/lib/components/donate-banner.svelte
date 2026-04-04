<script lang="ts">
	let dismissed = $state(false);

	import { onMount } from 'svelte';
	onMount(() => {
		if (typeof localStorage !== 'undefined' && localStorage.getItem('dt-donate-dismissed')) {
			dismissed = true;
		}
	});

	function dismiss() {
		dismissed = true;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('dt-donate-dismissed', '1');
		}
	}
</script>

{#if !dismissed}
	<div class="banner">
		<span>driveTree is free &amp; open source.</span>
		<a href="https://buymeacoffee.com/seidsmatti" target="_blank" rel="noopener">Buy me a coffee</a>
		<button class="dismiss" onclick={dismiss} aria-label="Dismiss">&times;</button>
	</div>
{/if}

<style>
	.banner {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--color-bg-secondary);
		border-bottom: 1px solid var(--color-border-secondary);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		justify-content: center;
		flex-wrap: wrap;
	}

	.banner a {
		color: var(--color-warning);
		font-weight: 500;
	}

	.dismiss {
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		font-size: var(--text-base);
		cursor: pointer;
		padding: 0 var(--space-1);
		line-height: 1;
		margin-left: var(--space-2);
	}
	.dismiss:hover {
		color: var(--color-text-primary);
	}
</style>
