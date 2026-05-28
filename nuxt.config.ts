import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	css: ['~/assets/styles/globals.css'],
	modules: ['@nuxt/eslint', '@nuxtjs/i18n', '@vueuse/nuxt'],
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
	app: {
		head: {
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
