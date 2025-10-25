import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { Language } from '$lib/constants/language.ts';
import type { LanguageData } from '$lib/interfaces/languageData.ts';

// Mock dependencies
vi.mock('$lib/constants/isBrowser', () => ({
	isBrowser: true,
}));

// Mock localStorage
const mockLocalStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	clear: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
	value: mockLocalStorage,
	writable: true,
});

describe('languageData', () => {
	const mockLanguageDataFi: LanguageData = {
		cards: [
			{
				id: 1,
				timedEvent: false,
				targetPlayer: false,
				tags: [],
				title: 'Test Card FI',
				description: 'This is a test card in Finnish',
			},
		],
		language: Language.FI,
	};

	const mockLanguageDataEn: LanguageData = {
		cards: [
			{
				id: 2,
				timedEvent: false,
				targetPlayer: false,
				tags: [],
				title: 'Test Card EN',
				description: 'This is a test card in English',
			},
		],
		language: Language.EN,
	};

	const mockLanguageDataRecord: Record<Language, LanguageData> = {
		[Language.FI]: mockLanguageDataFi,
		[Language.EN]: mockLanguageDataEn,
	};

	beforeEach(() => {
		Object.defineProperty(globalThis, 'localStorage', {
			value: mockLocalStorage,
			writable: true,
		});
		vi.doMock('$lib/constants/isBrowser', () => ({
			isBrowser: true,
		}));
		vi.clearAllMocks();
		mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockLanguageDataRecord));
		mockLocalStorage.setItem.mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.resetModules();
	});

	describe('initialization', () => {
		it('should initialize with data from localStorage when browser', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			const storeValue = get(languageData);
			expect(storeValue).toEqual(mockLanguageDataRecord);
			expect(mockLocalStorage.getItem).toHaveBeenCalledWith('languageData');
		});

		it('should initialize with empty object when localStorage has no data', async () => {
			mockLocalStorage.getItem.mockReturnValue(null);

			vi.resetModules();
			const { languageData: freshLanguageData } = await import('$lib/stores/languageData');
			const storeValue = get(freshLanguageData);
			expect(storeValue).toEqual({});
		});

		it('should initialize with empty object when localStorage has invalid JSON', async () => {
			mockLocalStorage.getItem.mockReturnValue('invalid json');

			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			vi.resetModules();
			const { languageData: freshLanguageData } = await import('$lib/stores/languageData');
			const storeValue = get(freshLanguageData);
			expect(storeValue).toEqual({});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Failed to parse languageData from localStorage:',
				expect.any(SyntaxError),
			);

			consoleErrorSpy.mockRestore();
		});

		it('should initialize with empty object when not in browser', async () => {
			// Mock isBrowser to false
			vi.doMock('$lib/constants/isBrowser', () => ({
				isBrowser: false,
			}));

			vi.resetModules();
			const { languageData: freshLanguageData } = await import('$lib/stores/languageData');
			const storeValue = get(freshLanguageData);
			expect(storeValue).toEqual({});

			// Restore mock
			vi.doMock('$lib/constants/isBrowser', () => ({
				isBrowser: true,
			}));
		});
	});

	describe('subscription', () => {
		it('should allow subscribing to store updates', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			const unsubscribe = languageData.subscribe(() => {});
			expect(typeof unsubscribe).toBe('function');

			// Test that unsubscribe works
			unsubscribe();
		});

		it('should notify subscribers when data changes', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			return new Promise<void>((resolve) => {
				let callCount = 0;

				const unsubscribe = languageData.subscribe((value) => {
					callCount++;

					if (callCount === 2) {
						expect(value.fi).toEqual(mockLanguageDataFi);
						unsubscribe();
						resolve();
					}
				});

				// Update the store
				languageData.set({
					[Language.FI]: mockLanguageDataFi,
					[Language.EN]: mockLanguageDataEn,
				});
			});
		});
	});

	describe('localStorage persistence', () => {
		it('should persist data to localStorage when store updates', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			const newData = mockLanguageDataRecord;
			languageData.set(newData);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'languageData',
				JSON.stringify(newData),
			);
		});

		it('should handle localStorage setItem errors gracefully', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			mockLocalStorage.setItem.mockImplementation(() => {
				throw new Error('LocalStorage quota exceeded');
			});

			const newData = mockLanguageDataRecord;

			// Should not throw
			expect(() => {
				languageData.set(newData);
			}).not.toThrow();

			consoleErrorSpy.mockRestore();
		});
	});

	describe('store operations', () => {
		it('should update store with set method', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			const newData = {
				[Language.FI]: mockLanguageDataFi,
				[Language.EN]: {
					cards: [
						{
							id: 2,
							timedEvent: false,
							targetPlayer: false,
							tags: [],
							title: 'Test Card EN',
							description: 'This is a test card in English',
						},
					],
					language: Language.EN,
				},
			};

			languageData.set(newData);

			const storeValue = get(languageData);
			expect(storeValue).toEqual(newData);
		});

		it('should update store with update method', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			languageData.set(mockLanguageDataRecord);

			const newEnglishData = {
				cards: [
					{
						id: 3,
						timedEvent: false,
						targetPlayer: false,
						tags: [],
						title: 'New Test card EN',
						description: 'This is a new test card in English',
					},
				],
			};

			languageData.update((current) => ({
				...current,
				[Language.FI]: mockLanguageDataFi,
				[Language.EN]: { ...current[Language.EN], ...newEnglishData },
			}));

			const storeValue = get(languageData);
			expect(storeValue).toEqual({
				[Language.FI]: mockLanguageDataFi,
				[Language.EN]: { ...mockLanguageDataEn, ...newEnglishData },
			});
		});

		it('should handle complex data structures', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			const complexData = {
				[Language.FI]: {
					cards: [
						{
							id: 1,
							timedEvent: false,
							targetPlayer: false,
							tags: [],
							title: 'Test Card FI',
							description: 'This is a test card in Finnish',
						},
					],
					language: Language.FI,
				},
				[Language.EN]: {
					cards: [
						{
							id: 2,
							timedEvent: false,
							targetPlayer: false,
							tags: [],
							title: 'Test Card EN',
							description: 'This is a test card in English',
						},
					],
					language: Language.EN,
				},
			};

			languageData.set(complexData);

			const storeValue = get(languageData);
			expect(storeValue).toEqual(complexData);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'languageData',
				JSON.stringify(complexData),
			);
		});
	});

	describe('edge cases', () => {
		it('should handle empty object updates', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			languageData.set({} as Record<Language, LanguageData>);

			const storeValue = get(languageData);
			expect(storeValue).toEqual({});
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'languageData',
				'{}',
			);
		});

		it('should handle null values gracefully', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			// @ts-ignore - testing edge case
			languageData.set(null);

			const storeValue = get(languageData);
			expect(storeValue).toBeNull();
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'languageData',
				'null',
			);
		});

		it('should handle undefined values gracefully', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			// @ts-ignore - testing edge case
			languageData.set(undefined);

			const storeValue = get(languageData);
			expect(storeValue).toBeUndefined();
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'languageData',
				undefined,
			);
		});
	});

	describe('multiple subscribers', () => {
		it('should handle multiple subscribers correctly', async () => {
			const { languageData } = await import('$lib/stores/languageData');
			return new Promise<void>((resolve) => {
				let subscriber1Calls = 0;
				let subscriber2Calls = 0;

				const unsubscribe1 = languageData.subscribe(() => {
					subscriber1Calls++;
				});

				const unsubscribe2 = languageData.subscribe(() => {
					subscriber2Calls++;

					if (subscriber2Calls === 2) {
						expect(subscriber1Calls).toBe(2);
						unsubscribe1();
						unsubscribe2();
						resolve();
					}
				});

				// Update the store
				languageData.set(mockLanguageDataRecord);
			});
		});
	});
});
