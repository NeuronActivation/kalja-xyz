import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({ fallback: '404.html' }),
		}),
	],
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: './src/vitest-setup.ts',
		// direnv keeps a copy of the repo in .direnv/flake-inputs, which would otherwise be run as tests.
		exclude: [...configDefaults.exclude, '.direnv/**'],
	},
});
