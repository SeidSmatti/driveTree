<script lang="ts">
	let { cachedAt, onDismiss }: { cachedAt: string; onDismiss: () => void } = $props();

	function getAge(iso: string): string {
		const ms = Date.now() - new Date(iso).getTime();
		const hours = Math.floor(ms / (1000 * 60 * 60));
		if (hours < 1) return 'less than an hour';
		if (hours === 1) return '1 hour';
		if (hours < 24) return `${hours} hours`;
		return `${Math.floor(hours / 24)} days`;
	}
</script>

<div class="warning" role="alert">
	<span class="warning-icon">&#9888;</span>
	<div class="warning-text">
		<strong>Showing cached data</strong> (up to {getAge(cachedAt)} old).
		Google is temporarily limiting requests.
	</div>
	<button class="dismiss" onclick={onDismiss} aria-label="Dismiss warning">&times;</button>
</div>

<style>
	.warning {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-4);
		background: var(--color-warning-bg);
		border: 1px solid var(--color-warning);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-warning);
	}

	.warning-icon {
		flex-shrink: 0;
		font-size: var(--text-base);
		line-height: 1;
	}

	.warning-text {
		flex: 1;
	}
	.warning-text strong {
		color: var(--color-text-primary);
	}

	.dismiss {
		flex-shrink: 0;
		background: none;
		border: none;
		color: var(--color-warning);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: 0;
		line-height: 1;
		opacity: 0.7;
	}
	.dismiss:hover {
		opacity: 1;
	}
</style>
