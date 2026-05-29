## 2024-05-29 - Missing Security Headers in Nuxt App
**Vulnerability:** The application was missing basic security HTTP response headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Strict-Transport-Security).
**Learning:** Nuxt 3/4 doesn't provide these by default. You need to explicitly configure them via `routeRules` in `nuxt.config.ts` or use a module like `nuxt-security`.
**Prevention:** Always add a baseline set of security headers to `nuxt.config.ts` when bootstrapping a new Nuxt project.
