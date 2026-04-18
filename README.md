# Prediction Tool Vue

Nuxt 4 / Vue 3 port of the original `prediction-tool` HDB resale price prediction app.

The app lets a user enter a flat profile and get:

- an estimated resale price
- a 12-month trend view for that scenario
- a lightweight bilingual interface (`en` / `zh`)
- persisted form, theme, and language preferences in local storage

## Background

`prediction-tool` is the original repository and the React / Next.js implementation of the project. This repository is the Nuxt / Vue port.

The original project was built for an EE4802 minor project and uses regression models only. There is no Python model-serving backend in this repo. The frontend submits form data to the existing prediction API endpoint and renders the returned trend data.

Because of the way the original project data/model pipeline works, the tool does not forecast arbitrary future dates. It works against the fixed prediction window exposed by the upstream API.

## Stack

- Nuxt 4
- Vue 3
- TypeScript
- ESLint
- custom CSS
- SVG-based trend chart rendering

## App Structure

This repo now follows the canonical Nuxt `app/` layout:

- [app/app.vue](./app/app.vue)
- [app/pages/index.vue](./app/pages/index.vue)
- [app/components/prediction](./app/components/prediction)
- [app/utils](./app/utils)
- [app/assets/styles/prediction.css](./app/assets/styles/prediction.css)
- [locales](./locales)

## Development

Install dependencies with Bun:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

The default local URL is usually:

```text
http://localhost:3000
```

## Scripts

```bash
bun run dev
bun run build
bun run preview
bun run lint
bun run lint:fix
```

## Notes

- The prediction request is sent to `https://ee4802-g20-tool.shenghaoc.workers.dev/api/prices`.
- Theme, language, and form values are persisted locally in the browser.
- The chart is rendered as SVG to avoid client-only canvas/chart bootstrapping issues in Nuxt.

## Status

This is no longer the default Nuxt starter. The repository has been converted into a project-specific Nuxt / Vue implementation of the original `prediction-tool` app.
