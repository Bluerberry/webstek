import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		experimental: { remoteFunctions: true },
		alias: {
			$assets: 'src/lib/assets',
			$components: 'src/lib/components',
			$server: 'src/lib/server',
			$stores: 'src/lib/stores',
			$styles: 'src/lib/styles',
			$validation: 'src/lib/validation',
			$scripts: 'src/lib/scripts'
		}
	},
	
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
