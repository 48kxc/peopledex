# PeopleDex — Cloudflare Pages

# Deploy via Cloudflare Pages Git integration (easiest):
#   1. Push this repo to GitHub
#   2. Connect repo in Cloudflare Pages dashboard
#   3. Set:
#      - Framework preset: Next.js
#      - Build command: npm run build
#      - Build output: .next
#      - Environment variable: OPENROUTER_API_KEY = your_key
#   4. Deploy

# OR deploy manually:
#   npm install
#   npm run build
#   npx wrangler pages deploy .next --branch main

# Local dev:
#   OPENROUTER_API_KEY=your_key npm run dev
