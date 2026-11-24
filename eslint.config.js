import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import { loadConfig } from '@sveltejs/load-config';

const loadedConfig = await loadConfig('./', { traverse: false });
if (loadedConfig && 'error' in loadedConfig) throw loadedConfig.error;
const svelteConfig = loadedConfig?.config;

export default ts.config(
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'.direnv/',
			'coverage/',
			'e2e/playwright-report/',
			'e2e/test-results/',
		],
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
);
