# PeopleDex — Cloudflare Pages

## Deploy via Git (Recommended)

1. Push this repo to GitHub
2. In Cloudflare Pages dashboard → Create Project → Connect your repo
3. Configure:
   - **Framework preset:** None (static site)
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Environment variables:**
     - `OPENROUTER_API_KEY` = your OpenRouter API key (set it for both Production and Preview if you deploy both)
4. Deploy

The `functions/api/` directory is auto-detected by Cloudflare Pages and handles `/api/verify-person`, `/api/verify-quest`, `/api/generate-quests`.

`public/_routes.json` sends only `/api/*` requests to Pages Functions. Keep the API key in the Cloudflare Pages dashboard; it is intentionally not declared in `wrangler.toml`.

## Local Dev

```bash
npm run dev
```

API routes work locally because `output: "export"` is disabled in development mode. Set your API key in `.env.local`:

```
OPENROUTER_API_KEY=sk-or-v1-...
```
