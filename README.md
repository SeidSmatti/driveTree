# driveTree

**Browse any public Google Drive folder as a clean file tree with syntax highlighting, downloads, and shareable links.**

No sign-up. No install. Paste a link and go.

**Live:** [drivetree.net](https://drivetree.net)

---

## Features

**File browsing**
- GitHub-style file tree with expand/collapse and lazy-loaded subfolders
- SVG file icons, file sizes, modification dates
- Keyboard navigation (arrow keys, Home/End)
- Responsive — works on mobile with 44px touch targets

**File viewing**
- Syntax highlighting for 40+ languages (Shiki, lazy-loaded)
- Line numbers via CSS counters (zero DOM overhead)
- Copy-to-clipboard button on every file
- Inline image rendering, embedded PDFs
- Google Docs/Sheets/Slides detection with "Open in Drive" link

**Downloads**
- Per-file download button (appears on hover, always visible on mobile)
- Full-folder ZIP download with progress bar and cancel
- Concurrent fetching (5 parallel), size warnings, hard limits
- File System Access API streaming where supported

**Sharing**
- Every folder view gets a permanent short link
- Copy link button in the header
- Open Graph + Twitter Card meta tags for rich previews

**Infrastructure**
- Google Drive API v3 server-side (API key never exposed to client)
- Folder listings cached for 1 hour with 24-hour stale fallback
- File content streamed through server, never stored
- Rate limiting on link creation (20/hour/IP)
- Dismissible donation banner (Buy Me a Coffee)

---

## How It Works

```
User pastes Drive URL
        │
        ▼
   POST /api/links ──▶ Generate short ID, store in KV
        │
        ▼
   GET /api/folder/:id ──▶ Check KV cache
        │                       │
        │ (cache miss)          │ (cache hit)
        ▼                       ▼
   Drive API v3 ──▶ Parse ──▶ Cache in KV ──▶ Return JSON
        │
        ▼
   Browser renders file tree
        │
        ▼
   User clicks a file
        │
        ▼
   GET /api/file/:id ──▶ Drive API (alt=media) ──▶ Stream to browser
        │
        ▼
   Shiki highlights ──▶ Rendered in viewer
```

All Drive API calls happen server-side. The API key is in an environment variable, never in the client bundle. File content streams through the server but is never stored.

---

## Quick Start

```bash
git clone https://github.com/SeidSmatti/drivetree.git
cd drivetree

npm install

# Set your Google Drive API key
cp .env.example .env
# Edit .env: GOOGLE_DRIVE_API_KEY=your-key-here

npm run dev
```

Then open `http://localhost:5173` and paste a public Google Drive folder URL.

### Getting a Google Drive API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable **Google Drive API** under APIs & Services > Library
4. Create an **API key** under APIs & Services > Credentials
5. (Optional) Restrict the key to Google Drive API only

The API is free with generous quotas. With caching, driveTree makes very few API calls.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (hot reload, in-memory KV) |
| `npm run build` | Production build (Cloudflare Pages adapter) |
| `npm run test` | Run 70 tests across 8 files (< 400ms) |
| `npm run check` | Svelte/TypeScript type checking |
| `npm run preview` | Preview production build locally |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | [SvelteKit](https://svelte.dev) | Full-stack, SSR, small bundles, server routes |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) + Workers | Free tier, edge deployment, KV storage |
| Data | [Google Drive API v3](https://developers.google.com/drive/api/v3) | Official, free, reliable |
| Storage | [Cloudflare KV](https://developers.cloudflare.com/kv/) | Link persistence, metadata cache, rate limiting |
| Highlighting | [Shiki](https://shiki.style) | VS Code-quality syntax highlighting, lazy-loaded |
| ZIP | [JSZip](https://stuk.github.io/jszip/) | Client-side ZIP generation, lazy-loaded |
| Fonts | [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Modern sans-serif + monospace |

---

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte                        # Landing page
│   ├── +layout.svelte                      # Global layout, design tokens, fonts
│   ├── legal/+page.svelte                  # Legal/privacy page
│   ├── browse/[shortId]/[...path]/
│   │   ├── +page.svelte                    # Browse page (tree + file viewer)
│   │   └── +page.ts                        # Page load function
│   └── api/
│       ├── links/+server.ts                # POST: create short link
│       ├── links/[shortId]/+server.ts      # GET: retrieve link
│       ├── folder/[folderId]/+server.ts    # GET: list folder (cached)
│       ├── file/[fileId]/+server.ts        # GET: proxy file content
│       └── health/+server.ts               # GET: health check
├── lib/
│   ├── components/
│   │   ├── file-tree.svelte                # Tree container with item count
│   │   ├── file-tree-item.svelte           # Tree row (folder/file, keyboard nav)
│   │   ├── file-viewer.svelte              # File content viewer (code, image, PDF)
│   │   ├── skeleton-tree.svelte            # Loading skeleton
│   │   ├── stale-warning.svelte            # Stale cache warning banner
│   │   ├── zip-download.svelte             # Folder ZIP download with progress
│   │   └── donate-banner.svelte            # Dismissible donation banner
│   ├── drive/
│   │   ├── client.ts                       # Calls /api/folder/:id
│   │   ├── content.ts                      # Download URLs, render modes, language IDs
│   │   ├── icons.ts                        # SVG icons, file size/date formatting
│   │   └── types.ts                        # FileNode type
│   ├── server/
│   │   ├── drive-api.ts                    # Google Drive API v3 client
│   │   ├── links.ts                        # Short link CRUD + dedup
│   │   ├── rate-limit.ts                   # KV-based per-IP rate limiter
│   │   └── kv.ts                           # In-memory KV mock for local dev
│   ├── stores/
│   │   └── tree.ts                         # Svelte store for tree state
│   └── utils/
│       └── parse-drive-url.ts              # Google Drive URL parser
├── app.html                                # HTML shell (fonts, viewport)
└── app.d.ts                                # TypeScript types (Platform, KV)
```

---

## Environment Variables

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `GOOGLE_DRIVE_API_KEY` | Server only | Yes | Google Drive API v3 key. Set in `.env` locally, in Cloudflare Pages env for production. Never exposed to the client. |

For local development, the app uses an in-memory KV mock — no Cloudflare account needed to run `npm run dev`.

---

## Deployment

driveTree deploys to Cloudflare Pages (free tier). See [DEPLOY.md](../DEPLOY.md) for the full step-by-step guide covering:

- Google Drive API key setup
- Cloudflare Pages project creation
- KV namespace creation and binding
- GitHub Actions CI/CD (automatic deploy on push)
- Custom domain + free SSL
- Security and cost breakdown

### Quick deploy

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=drivetree
```

---

## Design

- Dark theme with CSS custom properties (design tokens) — all colors, spacing, radii, typography defined in `:root`
- Responsive: 3 breakpoints (mobile/tablet/desktop) with scaled tree indentation and row heights
- Accessibility: semantic `<ul>/<li>` tree, `role="treeitem"`, `aria-expanded`, `aria-level`, roving tabindex, `prefers-reduced-motion`
- Inter + JetBrains Mono fonts loaded from Google Fonts
- Initial page load: ~6.5 KB JS. Shiki loads lazily (~9.6 MB) only when a file is viewed.

---

## Testing

70 tests across 8 files covering:

- **URL parsing** — all Google Drive URL formats, edge cases, injection attempts
- **Link service** — create, dedup, retrieve, view count, invalid IDs
- **Drive API client** — folder listing, pagination, sorting, error handling
- **Content utils** — render mode detection, language IDs, download URLs, Google Doc detection
- **Icons** — SVG mapping, file size formatting, relative date formatting
- **Rate limiter** — allow/block logic, independent keys
- **Integration** — concurrent creates, many links, full CRUD flow

```bash
npm run test
```

---

## License

[GNU General Public License v3.0](LICENSE)

You are free to use, modify, and distribute this software under the terms of the GPL v3.

---

## Author

**Seid Smatti** — [GitHub](https://github.com/SeidSmatti)

If you find driveTree useful, consider [buying me a coffee](https://buymeacoffee.com/seidsmatti).
