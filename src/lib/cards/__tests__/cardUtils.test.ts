import { describe, expect, it, vi } from 'vitest';
import { getStoredCards } from '$lib/cards/cardUtils.ts';
import { Language } from '$lib/constants/language.ts';

// Mock the store.
vi.mock('$lib/stores/languageData', () => ({
	languageData: {
		subscribe: vi.fn(),
		set: vi.fn(),
		update: vi.fn(),
	},
}));

// Mock svelte/store get function.
vi.mock('svelte/store', async () => {
	const actual = await vi.importActual('svelte/store');
	return {
		...actual,
		get: vi.fn(),
	};
});

import { get } from 'svelte/store';

describe('getStoredCards', () => {
	it('should return cards for specified language', () => {
		const mockCards = [
			{
				id: 1,
				title: 'Test Card',
				description: 'Test Desc',
				timedEvent: false,
				targetPlayer: false,
				tags: [],
			},
		];

		const mockStoreData = {
			[Language.EN]: { cards: mockCards, language: Language.EN },
			[Language.FI]: { cards: [], language: Language.FI },
		};

		vi.mocked(get).mockReturnValue(mockStoreData);

		const result = getStoredCards(Language.EN);

		expect(result).toEqual(mockCards);
	});

	it('should return null when no cards exist for language', () => {
		const mockStoreData = {
			[Language.EN]: { cards: [], language: Language.EN },
		};

		vi.mocked(get).mockReturnValue(mockStoreData);

		const result = getStoredCards(Language.FI);

		expect(result).toBeNull();
	});

	it('should return null when store data is undefined', () => {
		vi.mocked(get).mockReturnValue({});

		const result = getStoredCards(Language.EN);

		expect(result).toBeNull();
	});
});
