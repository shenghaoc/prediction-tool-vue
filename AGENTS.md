# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a single Nuxt 4 / Vue 3 frontend application — an HDB resale flat price prediction tool. There is no backend service in this repo; predictions come from an external Cloudflare Worker API.

### Running the app

- **Package manager**: Bun (lockfile: `bun.lock`)
- **Setup**: `bun install` && `bun run nuxt prepare`
- **Dev server**: `bun run dev` → http://localhost:3000
- **Lint**: `bun run lint`
- **Build**: `bun run build`

### Important caveats

- ESLint config imports from `.nuxt/eslint.config.mjs`. If you get `ERR_MODULE_NOT_FOUND` for that file, run `bun run nuxt prepare` to generate it.
- The `tsconfig.json` extends `.nuxt/tsconfig.json` — same requirement applies for TypeScript tooling.
- The prediction API endpoint (`https://ee4802-g20-tool.shenghaoc.workers.dev/api/prices`) is external and called from the browser at runtime. No local backend setup is needed.
- No database or Docker is required for local development.
