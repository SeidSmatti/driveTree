<svelte:head>
	<title>Legal — driveTree</title>
</svelte:head>

<main>
	<article>
		<h1>Legal</h1>

		<section>
			<h2>License</h2>
			<p>
				driveTree is free software, released under the
				<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank" rel="noopener">GNU General Public License v3.0</a>.
				The source code is available on
				<a href="https://github.com/SeidSmatti/drivetree" target="_blank" rel="noopener">GitHub</a>.
			</p>
		</section>

		<section>
			<h2>Privacy</h2>
			<p>driveTree does not collect personal data. Specifically:</p>
			<ul>
				<li>No user accounts or sign-up.</li>
				<li>No cookies (except a localStorage flag if you dismiss the donation banner).</li>
				<li>No analytics trackers or third-party scripts.</li>
				<li>File content is streamed through the server but never stored.</li>
				<li>The only data stored is short link mappings (folder IDs) and cached folder metadata (file names, sizes), which contain no personal information.</li>
			</ul>
		</section>

		<section>
			<h2>Google Drive</h2>
			<p>
				driveTree accesses public Google Drive folders using the
				<a href="https://developers.google.com/drive/api/v3/about-sdk" target="_blank" rel="noopener">Google Drive API v3</a>.
				Only publicly shared folders and files are accessible. driveTree cannot access private or restricted content.
			</p>
		</section>

		<section>
			<h2>DMCA / Takedown</h2>
			<p>
				driveTree does not host any content. It provides a browsing interface for files hosted on Google Drive.
				If you believe content accessible through driveTree infringes your copyright, please
				<a href="https://support.google.com/legal/troubleshooter/1114905" target="_blank" rel="noopener">report it directly to Google</a>
				as the content host.
			</p>
		</section>

		<section>
			<h2>Contact</h2>
			<p>
				driveTree is maintained by <a href="https://github.com/SeidSmatti" target="_blank" rel="noopener">Seid Smatti</a>.
				For issues or questions, please open an issue on
				<a href="https://github.com/SeidSmatti/drivetree/issues" target="_blank" rel="noopener">GitHub</a>.
			</p>
		</section>

		<a href="/" class="back-link">Back to driveTree</a>
	</article>
</main>

<style>
	main {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--space-10) var(--space-4);
	}

	h1 {
		font-size: var(--text-2xl);
		font-weight: 700;
		margin-bottom: var(--space-8);
		letter-spacing: -0.02em;
	}

	h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-2);
		color: var(--color-text-primary);
	}

	section {
		margin-bottom: var(--space-8);
	}

	p {
		color: var(--color-text-secondary);
		line-height: var(--leading-normal);
		margin-bottom: var(--space-2);
	}

	ul {
		color: var(--color-text-secondary);
		padding-left: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		transition: background var(--transition-fast);
	}
	.back-link:hover {
		background: var(--color-bg-tertiary);
		text-decoration: none;
	}
</style>
