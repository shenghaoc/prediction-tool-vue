export default defineNuxtConfig({
	css: ['~/assets/styles/prediction.css'],
	modules: ['@nuxt/eslint'],
	nitro: {
		preset: 'cloudflare-module',
		routeRules: {
			'/api/prices': {
				cors: true,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			}
		}
	},
	app: {
		head: {
			link: [
				{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400;1,9..40,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap'
				}
			]
		}
	}
});
