import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: './vitest-setup.ts',
		// direnv keeps a copy of the repo in .direnv/flake-inputs, which would otherwise be run as tests.
		exclude: [...configDefaults.exclude, '.direnv/**'],
	},
});
