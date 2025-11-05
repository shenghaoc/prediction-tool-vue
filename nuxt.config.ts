export default defineNuxtConfig({
				nitro: {
					preset: "bun", 
				},
				css: ['element-plus/dist/index.css'],
				modules: ['@element-plus/nuxt', '@nuxt/eslint']
});