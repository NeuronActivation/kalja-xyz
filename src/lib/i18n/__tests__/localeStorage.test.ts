import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStoredLanguage, setLanguage } from '$lib/i18n/localeStorage';
import { Language } from '$lib/constants/language';
import { getLocaleFromNavigator, locale } from 'svelte-i18n';

// Mock svelte-i18n
vi.mock('svelte-i18n', () => ({
	getLocaleFromNavigator: vi.fn(),
	locale: {
		set: vi.fn(),
	},
}));

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

describe('language utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getStoredLanguage', () => {
		it('should return stored language from localStorage', () => {
			localStorageMock.getItem.mockReturnValue('fi');

			const result = getStoredLanguage();

			expect(result).toBe(Language.FI);
			expect(localStorageMock.getItem).toHaveBeenCalledWith('selectedLanguage');
		});

		it('should return detected locale from navigator when no stored language exists', () => {
			localStorageMock.getItem.mockReturnValue(null);
			vi.mocked(getLocaleFromNavigator).mockReturnValue('fi-FI');

			const result = getStoredLanguage();

			expect(result).toBe(Language.FI);
			expect(getLocaleFromNavigator).toHaveBeenCalled();
		});

		it('should normalize navigator locale by splitting on hyphen', () => {
			localStorageMock.getItem.mockReturnValue(null);
			vi.mocked(getLocaleFromNavigator).mockReturnValue('en-US');

			const result = getStoredLanguage();

			expect(result).toBe(Language.EN);
		});

		it('should return English when detected locale is not a valid Language', () => {
			localStorageMock.getItem.mockReturnValue(null);
			vi.mocked(getLocaleFromNavigator).mockReturnValue('fr-FR');

			const result = getStoredLanguage();

			expect(result).toBe(Language.EN);
		});

		it('should return English when getLocaleFromNavigator returns undefined', () => {
			localStorageMock.getItem.mockReturnValue(null);
			vi.mocked(getLocaleFromNavigator).mockReturnValue(null);

			const result = getStoredLanguage();

			expect(result).toBe(Language.EN);
		});

		it('should return English when navigator locale is invalid after normalization', () => {
			localStorageMock.getItem.mockReturnValue(null);
			vi.mocked(getLocaleFromNavigator).mockReturnValue('xx-XX');

			const result = getStoredLanguage();

			expect(result).toBe(Language.EN);
		});
	});

	describe('setLanguage', () => {
		it('should set language in localStorage and update svelte-i18n locale', async () => {
			vi.mocked(locale.set).mockResolvedValue();

			await setLanguage(Language.FI);

			expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedLanguage', Language.FI);
			expect(locale.set).toHaveBeenCalledWith('fi');
		});

		it('should handle English language correctly', async () => {
			vi.mocked(locale.set).mockResolvedValue();

			await setLanguage(Language.EN);

			expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedLanguage', Language.EN);
			expect(locale.set).toHaveBeenCalledWith('en');
		});

		it('should log error for unsupported language', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// @ts-ignore - Testing invalid input
			await setLanguage('invalid');

			expect(consoleSpy).toHaveBeenCalledWith('Unsupported language: invalid');
			expect(localStorageMock.setItem).not.toHaveBeenCalled();
			expect(locale.set).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it('should handle empty string language', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// @ts-ignore - Testing invalid input
			await setLanguage('');

			expect(consoleSpy).toHaveBeenCalledWith('Unsupported language: ');
			expect(localStorageMock.setItem).not.toHaveBeenCalled();
			expect(locale.set).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});
