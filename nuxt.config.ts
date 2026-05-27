import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	css: ['~/assets/styles/globals.css'],
	modules: ['@nuxt/eslint'],
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
