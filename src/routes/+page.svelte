<script lang="ts">
	import { goto } from '$app/navigation';
	import { parseDriveUrl } from '$lib/utils/parse-drive-url';

	let inputValue = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		const result = parseDriveUrl(inputValue);
		if ('error' in result) {
			error = result.error;
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/links', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ folderId: result.folderId })
			});

			const data = await res.json();
			if (!res.ok && res.status !== 409) {
				error = data.error || 'Failed to create link';
				return;
			}

			await goto(data.url);
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>driveTree — Browse Google Drive folders beautifully</title>
</svelte:head>

<main>
	<div class="hero">
		<h1><span class="brand">drive</span><span class="brand-accent">Tree</span></h1>
		<p class="tagline">Paste a Google Drive link. Get a beautiful file browser.</p>

		<form onsubmit={handleSubmit}>
			<label for="drive-url" class="sr-only">Google Drive folder URL</label>
			<div class="input-group">
				<div class="input-wrapper">
					<svg class="input-icon" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.715 6.542L3.343 7.914a3 3 0 104.243 4.243l1.828-1.829A3 3 0 008.586 5.5L8 6.086a1 1 0 00-.154.199 2 2 0 01.861 3.337L6.88 11.45a2 2 0 11-2.83-2.83l.793-.792a4.018 4.018 0 01-.128-1.287z"/><path d="M11.285 9.458l1.372-1.372a3 3 0 00-4.243-4.243L6.586 5.671A3 3 0 007.414 10.5l.586-.586a1 1 0 00.154-.199 2 2 0 01-.861-3.337L9.12 4.55a2 2 0 112.83 2.83l-.793.792c.112.42.155.855.128 1.287z"/></svg>
					<input
						id="drive-url"
						type="text"
						bind:value={inputValue}
						placeholder="https://drive.google.com/drive/folders/..."
						disabled={loading}
						autocomplete="url"
					/>
				</div>
				<button type="submit" disabled={!inputValue.trim() || loading}>
					{#if loading}
						<span class="btn-spinner"></span>
					{:else}
						Browse
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>
					{/if}
				</button>
			</div>
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
		</form>

		<div class="features">
			<div class="feature">
				<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7H1.75z"/></svg>
				<span>File tree navigation</span>
			</div>
			<div class="feature">
				<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.72 3.22a.75.75 0 011.06 1.06L2.56 7.5l3.22 3.22a.75.75 0 01-1.06 1.06l-3.75-3.75a.75.75 0 010-1.06l3.75-3.75zm6.56 0a.75.75 0 10-1.06 1.06L13.44 7.5l-3.22 3.22a.75.75 0 101.06 1.06l3.75-3.75a.75.75 0 000-1.06l-3.75-3.75z"/></svg>
				<span>Syntax highlighting</span>
			</div>
			<div class="feature">
				<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z"/><path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.969a.749.749 0 111.06 1.06l-3.25 3.25a.749.749 0 01-1.06 0L4.22 6.78a.749.749 0 111.06-1.06l1.97 1.969z"/></svg>
				<span>Instant downloads</span>
			</div>
			<div class="feature">
				<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.715 6.542L3.343 7.914a3 3 0 104.243 4.243l1.828-1.829A3 3 0 008.586 5.5L8 6.086a1 1 0 00-.154.199 2 2 0 01.861 3.337L6.88 11.45a2 2 0 11-2.83-2.83l.793-.792a4.018 4.018 0 01-.128-1.287z"/><path d="M11.285 9.458l1.372-1.372a3 3 0 00-4.243-4.243L6.586 5.671A3 3 0 007.414 10.5l.586-.586a1 1 0 00.154-.199 2 2 0 01-.861-3.337L9.12 4.55a2 2 0 112.83 2.83l-.793.792c.112.42.155.855.128 1.287z"/></svg>
				<span>Shareable links</span>
			</div>
		</div>
	</div>

	<footer class="landing-footer">
		<div class="footer-links">
			<a href="https://github.com/SeidSmatti/drivetree" target="_blank" rel="noopener">GitHub</a>
			<span class="dot">&middot;</span>
			<a href="https://buymeacoffee.com/seidsmatti" target="_blank" rel="noopener">Donate</a>
			<span class="dot">&middot;</span>
			<a href="/legal">Legal</a>
		</div>
		<div class="footer-credit">
			Built by <a href="https://github.com/SeidSmatti" target="_blank" rel="noopener">Seid Smatti</a>
		</div>
	</footer>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: var(--space-6);
	}

	.hero {
		text-align: center;
		max-width: 520px;
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	h1 {
		font-size: var(--text-4xl);
		font-weight: 700;
		margin-bottom: var(--space-3);
		letter-spacing: -0.03em;
		line-height: var(--leading-tight);
	}

	.brand {
		color: var(--color-text-primary);
	}
	.brand-accent {
		color: var(--color-text-link);
	}

	.tagline {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-10);
		font-weight: 400;
	}

	form {
		width: 100%;
		margin-bottom: var(--space-10);
	}

	.input-group {
		display: flex;
		gap: var(--space-2);
	}

	.input-wrapper {
		flex: 1;
		position: relative;
	}

	.input-icon {
		position: absolute;
		left: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-tertiary);
		pointer-events: none;
	}

	input {
		width: 100%;
		padding: var(--space-3) var(--space-4) var(--space-3) 40px;
		font-size: var(--text-sm);
		font-family: var(--font-mono);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		background: var(--color-bg-input);
		color: var(--color-text-primary);
		outline: none;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-dim);
	}

	input::placeholder {
		color: var(--color-text-tertiary);
		font-family: var(--font-mono);
	}

	button {
		padding: var(--space-3) var(--space-5);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		font-weight: 600;
		border: none;
		border-radius: var(--radius-md);
		background: var(--color-accent);
		color: #fff;
		cursor: pointer;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		transition: background var(--transition-fast), transform var(--transition-fast);
	}

	button:hover:not(:disabled) {
		background: #4d94f8;
		transform: translateY(-1px);
	}

	button:active:not(:disabled) {
		transform: translateY(0);
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.error {
		color: var(--color-danger);
		font-size: var(--text-sm);
		margin-top: var(--space-2);
		text-align: left;
	}

	.features {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2) var(--space-6);
		text-align: left;
	}

	.feature {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: 500;
	}
	.feature svg {
		flex-shrink: 0;
		color: var(--color-text-tertiary);
	}

	/* Footer */
	.landing-footer {
		padding: var(--space-6) 0;
		text-align: center;
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.footer-links {
		display: flex;
		justify-content: center;
		gap: var(--space-2);
	}
	.footer-links a {
		color: var(--color-text-secondary);
	}
	.dot {
		color: var(--color-border-primary);
	}
	.footer-credit a {
		color: var(--color-text-secondary);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 640px) {
		h1 {
			font-size: var(--text-3xl);
		}
		.input-group {
			flex-direction: column;
		}
		.features {
			grid-template-columns: 1fr;
			gap: var(--space-2);
		}
		.tagline {
			font-size: var(--text-base);
		}
	}
</style>
