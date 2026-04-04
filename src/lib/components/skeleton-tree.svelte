<script lang="ts">
	const rows = [
		{ indent: 0, nameWidth: '120px', hasSize: false },
		{ indent: 0, nameWidth: '80px', hasSize: false },
		{ indent: 0, nameWidth: '140px', hasSize: false },
		{ indent: 0, nameWidth: '60px', hasSize: false },
		{ indent: 0, nameWidth: '160px', hasSize: true },
		{ indent: 0, nameWidth: '100px', hasSize: true },
	];
</script>

<div class="skeleton-tree" aria-hidden="true">
	{#each rows as row}
		<div class="skeleton-row" style:padding-left="calc({row.indent} * var(--tree-indent) + var(--space-3))">
			<span class="skeleton-chevron"></span>
			<span class="skeleton-icon"></span>
			<span class="skeleton-name" style:width={row.nameWidth}></span>
			{#if row.hasSize}
				<span class="skeleton-size"></span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.skeleton-tree {
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--tree-row-height);
		padding-right: var(--space-3);
		border-bottom: 1px solid var(--color-border-secondary);
	}
	.skeleton-row:last-child {
		border-bottom: none;
	}

	.skeleton-chevron {
		width: 16px;
		height: 8px;
		flex-shrink: 0;
	}

	.skeleton-icon {
		width: 16px;
		height: 16px;
		border-radius: 3px;
		background: var(--color-border-secondary);
		flex-shrink: 0;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-name {
		height: 12px;
		border-radius: 3px;
		background: var(--color-border-secondary);
		animation: pulse 1.5s ease-in-out infinite;
		animation-delay: 0.1s;
	}

	.skeleton-size {
		width: 48px;
		height: 10px;
		border-radius: 3px;
		background: var(--color-border-secondary);
		flex-shrink: 0;
		margin-left: auto;
		animation: pulse 1.5s ease-in-out infinite;
		animation-delay: 0.2s;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.6; }
	}
</style>
