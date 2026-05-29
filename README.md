# Prediction Tool Vue

Nuxt 4 / Vue 3 port of the original `prediction-tool` HDB resale price prediction app.

The app lets a user enter a flat profile and get:

- an estimated resale price
- a 12-month trend view for that scenario
- a lightweight bilingual interface (`en` / `zh`)
- persisted form, theme, and language preferences in local storage

## Background

`prediction-tool` is the original repository and the React / Next.js implementation of the project. This repository is the Nuxt / Vue port.

The original project was built for an EE4802 minor project and uses regression models only. There is no Python model-serving backend. The frontend submits a JSON request to the local `/api/prices` server route, which queries a Cloudflare D1 database directly using the pre-trained model coefficients and returns predicted prices.

Because of the way the original project data/model pipeline works, the tool does not forecast arbitrary future dates. It works against the fixed prediction window backed by the D1 database.

## Stack

- Nuxt 4
- Vue 3
- TypeScript
- ESLint
- `@nuxtjs/i18n` (bilingual `en` / `zh`)
- `@vueuse/nuxt` (color mode + persisted form state)
- custom CSS design system (DM Sans + Lora, glassmorphic UI)
- Chart.js via `vue-chartjs` wrapper
- Cloudflare Workers (Nitro `cloudflare-module` preset)
- Cloudflare D1 (prediction model coefficients)

## App Structure

- [server/api/prices.post.ts](./server/api/prices.post.ts) — prediction API route (D1 query)
- [app/app.vue](./app/app.vue)
- [app/pages/index.vue](./app/pages/index.vue)
- [app/components/prediction](./app/components/prediction)
- [app/utils](./app/utils)
- [app/assets/styles/prediction.css](./app/assets/styles/prediction.css)
- [i18n/locales](./i18n/locales) — `@nuxtjs/i18n` message catalogs (`en`, `zh`)
- [i18n/i18n.config.ts](./i18n/i18n.config.ts) — vue-i18n runtime options
- [wrangler.jsonc](./wrangler.jsonc) — Cloudflare Workers config with D1 binding

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The default local URL is:

```text
http://localhost:3000
```

For local development with D1 bindings, use wrangler:

```bash
npx wrangler dev
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:fix
```

## Deployment

The app is deployed to Cloudflare Workers via the Nitro `cloudflare-module` preset:

```bash
npm run build
npx wrangler deploy
```

The D1 database binding (`DB`) maps to `ee4802-g20-tool-db`.

## Notes

- The prediction request is sent to the local `/api/prices` server route, which queries D1 directly.
- Theme, language, and form values are persisted locally in the browser.
- The chart is rendered with `vue-chartjs` (framework-native Vue wrapper around Chart.js).
