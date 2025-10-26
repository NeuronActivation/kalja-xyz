import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock svelte-i18n
vi.mock('svelte-i18n', () => ({
	register: vi.fn(),
	init: vi.fn(),
	getLocaleFromNavigator: vi.fn(),
}));

describe('i18n index', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockFetch = vi.fn();

		vi.resetModules();
	});

	describe('registerLocales', () => {
		it('should register Finnish and English locales with correct paths', async () => {
			const { registerLocales } = await import('$lib/i18n/index');
			const { register } = await import('svelte-i18n');

			const mockJsonResponse = { key: 'value' };
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve(mockJsonResponse),
			});

			registerLocales(mockFetch);

			expect(register).toHaveBeenCalledWith('fi', expect.any(Function));
			expect(register).toHaveBeenCalledWith('en', expect.any(Function));

			const fiLoader = vi.mocked(register).mock.calls[0][1];
			await expect(fiLoader()).resolves.toEqual(mockJsonResponse);
			expect(mockFetch).toHaveBeenCalledWith('/locales/finnish.json');

			const enLoader = vi.mocked(register).mock.calls[1][1];
			await expect(enLoader()).resolves.toEqual(mockJsonResponse);
			expect(mockFetch).toHaveBeenCalledWith('/locales/english.json');
		});

		it('should handle fetch errors gracefully', async () => {
			const { registerLocales } = await import('$lib/i18n/index');
			const { register } = await import('svelte-i18n');

			const fetchError = new Error('Network error');
			mockFetch.mockRejectedValue(fetchError);

			registerLocales(mockFetch);

			const fiLoader = vi.mocked(register).mock.calls[0][1];

			await expect(fiLoader()).rejects.toThrow('Network error');
		});

		it('should handle JSON parsing errors', async () => {
			mockFetch.mockResolvedValue({
				json: () => Promise.reject(new Error('Invalid JSON')),
			});
			const { registerLocales } = await import('$lib/i18n/index');
			const { register } = await import('svelte-i18n');

			registerLocales(mockFetch);

			const fiLoader = vi.mocked(register).mock.calls[0][1];

			await expect(fiLoader()).rejects.toThrow('Invalid JSON');
		});
	});

	describe('init', () => {
		it('should initialize svelte-i18n with correct configuration', async () => {
			const { getLocaleFromNavigator, init } = await import('svelte-i18n');
			vi.mocked(getLocaleFromNavigator).mockReturnValue('en-US');

			await import('$lib/i18n/index');

			expect(init).toHaveBeenCalledWith({
				fallbackLocale: 'en',
				initialLocale: 'en',
			});
		});

		it('should use normalized navigator locale for initialLocale', async () => {
			const { getLocaleFromNavigator } = await import('svelte-i18n');
			vi.mocked(getLocaleFromNavigator).mockReturnValue('fi-FI');

			await import('$lib/i18n/index');
			const { init } = await import('svelte-i18n');

			// Re-import the module to trigger the init with the mocked value
			vi.resetModules();
			await import('$lib/i18n/index');

			expect(init).toHaveBeenCalledWith({
				fallbackLocale: 'en',
				initialLocale: 'fi',
			});
		});

		it('should handle undefined navigator locale', async () => {
			const { getLocaleFromNavigator } = await import('svelte-i18n');
			vi.mocked(getLocaleFromNavigator).mockReturnValue(null);

			await import('$lib/i18n/index');
			const { init } = await import('svelte-i18n');

			expect(init).toHaveBeenCalledWith({
				fallbackLocale: 'en',
				initialLocale: undefined,
			});
		});
	});
});
