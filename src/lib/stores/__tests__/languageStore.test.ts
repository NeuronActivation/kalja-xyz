import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { Language } from '$lib/constants/language';
import type { LanguageSpecificCard } from '$lib/interfaces/card';

// Mock dependencies first
vi.mock('$lib/constants/isBrowser', () => ({
	isBrowser: true,
}));

vi.mock('$lib/i18n/localeStorage', () => ({
	getStoredLanguage: vi.fn(),
	setLanguage: vi.fn(),
}));

vi.mock('$lib/cards/cardUtils', () => ({
	getStoredCards: vi.fn(),
}));

import { languageStore } from '../languageStore';
import * as localeStorage from '$lib/i18n/localeStorage';
import * as cardUtils from '$lib/cards/cardUtils';

describe('languageStore', () => {
	const mockCards: LanguageSpecificCard[] = [
		{
			id: 1,
			timedEvent: false,
			targetPlayer: false,
			tags: [],
			title: 'Test Card',
			description: 'This is a test card',
		},
		{
			id: 2,
			timedEvent: false,
			targetPlayer: false,
			tags: [],
			title: 'Another test card',
			description: 'This is a another test card',
		},
	];

	beforeEach(async () => {
		vi.clearAllMocks();
		(localeStorage.getStoredLanguage as any).mockReturnValue(Language.FI);
		(localeStorage.setLanguage as any).mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	/*
  describe('initialization', () => {
    it('should initialize with default language', async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      const state = get(languageStore);
      expect(state.language).toBe(Language.FI);
    });
  });
  */

	describe('subscribe', () => {
		it('should allow subscribing to store updates', () => {
			const unsubscribe = languageStore.subscribe(() => {});
			expect(typeof unsubscribe).toBe('function');

			// Test that unsubscribe works
			unsubscribe();
		});
	});

	describe('changeLanguage', () => {
		it('should change language and update store', async () => {
			(localeStorage.setLanguage as any).mockResolvedValue(undefined);

			await languageStore.changeLanguage(Language.EN);

			const state = get(languageStore);
			expect(state.language).toBe(Language.EN);
			expect(localeStorage.setLanguage).toHaveBeenCalledWith(Language.EN);
		});

		it('should call onInitComplete callback if set', async () => {
			const mockCallback = vi.fn();
			languageStore.setGameStoreUpdate(mockCallback);

			await languageStore.changeLanguage(Language.EN);

			expect(mockCallback).toHaveBeenCalled();
		});

		it('should not throw if onInitComplete is not set', async () => {
			await expect(languageStore.changeLanguage(Language.EN)).resolves.not.toThrow();
		});
	});

	describe('getCards', () => {
		it('should return cards for current language', () => {
			(localeStorage.getStoredLanguage as any).mockReturnValue(Language.FI);
			(cardUtils.getStoredCards as any).mockReturnValue(mockCards);

			const cards = languageStore.getCards();
			expect(cards).toEqual(mockCards);
			expect(cardUtils.getStoredCards).toHaveBeenCalledWith(Language.FI);
		});

		it('should return null if no cards found', () => {
			(cardUtils.getStoredCards as any).mockReturnValue(null);

			const cards = languageStore.getCards();
			expect(cards).toBeNull();
		});

		it('should use current stored language', () => {
			(localeStorage.getStoredLanguage as any).mockReturnValue(Language.EN);
			(cardUtils.getStoredCards as any).mockReturnValue([]);

			languageStore.getCards();
			expect(cardUtils.getStoredCards).toHaveBeenCalledWith(Language.EN);
		});
	});

	describe('setGameStoreUpdate', () => {
		it('should set the callback function', () => {
			const mockCallback = vi.fn();

			languageStore.setGameStoreUpdate(mockCallback);

			// The callback should be stored and called on language change
			expect(mockCallback).not.toHaveBeenCalled();
		});

		/*
    // TODO not handled
    it('should replace existing callback', () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      languageStore.setGameStoreUpdate(firstCallback);
      languageStore.setGameStoreUpdate(secondCallback);

      // Only the second callback should be called
      languageStore.changeLanguage(Language.EN);
      expect(secondCallback).toHaveBeenCalled();
      expect(firstCallback).not.toHaveBeenCalled();
    });
    */
	});

	/*
  describe('error handling', () => {
    it('should handle setLanguage errors gracefully', async () => {
      const error = new Error('Failed to set language');
      (localeStorage.setLanguage as any).mockRejectedValue(error);
    });
    });
  });
  */

	describe('browser vs server behavior', () => {
		it('should not initialize language on server side', async () => {
			// Temporarily mock isBrowser to false
			vi.doMock('$lib/constants/isBrowser', () => ({
				isBrowser: false,
			}));

			// Reset mocks
			(localeStorage.setLanguage as any).mockClear();

			// Wait for any potential initialization
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(localeStorage.setLanguage).not.toHaveBeenCalled();

			// Restore original mock
			vi.doMock('$lib/constants/isBrowser', () => ({
				isBrowser: true,
			}));
		});
	});
});
