# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Nuxt 4 / Vue 3 HDB resale flat price prediction tool. Prediction logic runs in a Nuxt server route (`server/api/prices.post.ts`) that queries a Cloudflare D1 database directly — there is no external backend.

### Running the app

- **Package manager**: npm (lockfile: `package-lock.json`)
- **Setup**: `npm install` && `npm run dev`
- **Dev server**: `npm run dev` → http://localhost:3000
- **Lint**: `npm run lint`
- **Build**: `npm run build`

### Important caveats

- ESLint config imports from `.nuxt/eslint.config.mjs`. If you get `ERR_MODULE_NOT_FOUND` for that file, run `npx nuxt prepare` to generate it.
- The `tsconfig.json` extends `.nuxt/tsconfig.json` — same requirement applies for TypeScript tooling.
- The prediction API route (`/api/prices`) queries the Cloudflare D1 database (`ee4802-g20-tool-db`) directly via a Workers binding. In local dev without `wrangler`, the D1 binding is unavailable — use `npx wrangler dev` for full local integration, or run `npm run dev` for frontend-only work.
- No Docker or external database setup is required for local development.
