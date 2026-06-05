import tailwindcss from '@tailwindcss/vite';

const isDev = process.env.NODE_ENV !== 'production';

export default defineNuxtConfig({
	css: ['~/assets/styles/globals.css'],
	sourcemap: {
		client: isDev,
		server: isDev
	},
	modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n', '@vueuse/nuxt'],
	colorMode: {
		storageKey: 'theme'
	},
	i18n: {
		strategy: 'no_prefix',
		defaultLocale: 'en',
		locales: [
			{ code: 'en', language: 'en-SG', name: 'English', file: 'en.json' },
			{ code: 'zh', language: 'zh-Hans-SG', name: '中文', file: 'zh.json' }
		],
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_redirected',
			redirectOn: 'root'
		}
	},
	vite: {
		plugins: [tailwindcss()]
	},
	nitro: {
		preset: 'cloudflare-module'
	},
	routeRules: {
		'/**': {
			headers: {
				'X-Content-Type-Options': 'nosniff',
				'X-Frame-Options': 'DENY',
				'Referrer-Policy': 'strict-origin-when-cross-origin',
				'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
			}
		}
	},
	app: {
		head: {
			meta: [
				{
					name: 'viewport',
					content: 'width=device-width, initial-scale=1, viewport-fit=cover'
				},
				{
					name: 'theme-color',
					content: '#4f46e5',
					media: '(prefers-color-scheme: light)'
				},
				{
					name: 'theme-color',
					content: '#818cf8',
					media: '(prefers-color-scheme: dark)'
				}
			],
			link: [
				{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500&display=swap'
				}
			]
		}
	}
});
