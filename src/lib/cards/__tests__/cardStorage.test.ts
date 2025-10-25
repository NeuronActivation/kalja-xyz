import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCards, loadSingleCard } from '$lib/cards/cardStorage.ts';
import { createCards } from '$lib/cards/createCards.ts';
import { languageData } from '$lib/stores/languageData.ts';
import { Language } from '$lib/constants/language.ts';
import { Tag } from '$lib/constants/tag.ts';

// Mock dependencies
vi.mock('$lib/cards/createCards');
vi.mock('$lib/stores/languageData', () => ({
	languageData: {
		set: vi.fn(),
		subscribe: vi.fn(),
		update: vi.fn(),
	},
}));

// Mock svelte/store get function
vi.mock('svelte/store', async () => {
	const actual = await vi.importActual('svelte/store');
	return {
		...actual,
		get: vi.fn(),
	};
});

import { get } from 'svelte/store';

const mockCardsData = {
	[Language.EN]: {
		cards: [
			{
				id: 1,
				title: 'Card 1',
				description: 'Desc 1',
				timedEvent: false,
				targetPlayer: false,
				tags: [],
			},
			{
				id: 2,
				title: 'Card 2',
				description: 'Desc 2',
				timedEvent: false,
				targetPlayer: false,
				tags: [],
			},
		],
		language: Language.EN,
	},
	[Language.FI]: {
		cards: [
			{
				id: 1,
				title: 'Kortti 1',
				description: 'Kuvaus 1',
				timedEvent: false,
				targetPlayer: false,
				tags: [],
			},
			{
				id: 2,
				title: 'Kortti 2',
				description: 'Kuvaus 2',
				timedEvent: false,
				targetPlayer: false,
				tags: [],
			},
		],
		language: Language.FI,
	},
};

describe('loadCards', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should load cards and return minimum card count', async () => {
		vi.mocked(createCards).mockResolvedValue(mockCardsData);

		const result = await loadCards([Tag.EVENT], [Tag.RANDOM_TARGET]);

		expect(createCards).toHaveBeenCalledWith(Number.MAX_SAFE_INTEGER, [Tag.EVENT], [
			Tag.RANDOM_TARGET,
		]);
		expect(languageData.set).toHaveBeenCalledWith(mockCardsData);
		expect(result).toBe(2); // Minimum of [2, 2]
	});

	it('should return 0 when createCards returns null', async () => {
		vi.mocked(createCards).mockResolvedValue(null);

		const result = await loadCards([Tag.EVENT], []);

		expect(result).toBe(0);
		expect(languageData.set).not.toHaveBeenCalled();
	});

	it('should return 0 when createCards throws error', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(createCards).mockRejectedValue(new Error('Failed'));

		const result = await loadCards([Tag.EVENT], []);
		expect(consoleSpy).toHaveBeenCalled();

		expect(result).toBe(0);
		consoleSpy.mockRestore();
	});

	it('should handle different card counts per language', async () => {
		const unevenCardsData = {
			[Language.EN]: { cards: Array(5).fill({}), language: Language.EN },
			[Language.FI]: { cards: Array(3).fill({}), language: Language.FI },
		};
		vi.mocked(createCards).mockResolvedValue(unevenCardsData);

		const result = await loadCards([Tag.EVENT], []);

		expect(result).toBe(3); // Minimum of [5, 3]
	});
});

describe('loadSingleCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should replace card at specified index', async () => {
		const currentStoreData = {
			[Language.EN]: {
				cards: [
					{
						id: 1,
						title: 'Old Card 1',
						description: 'Old Desc 1',
						timedEvent: false,
						targetPlayer: false,
						tags: [],
					},
					{
						id: 2,
						title: 'Old Card 2',
						description: 'Old Desc 2',
						timedEvent: false,
						targetPlayer: false,
						tags: [],
					},
				],
				language: Language.EN,
			},
			[Language.FI]: {
				cards: [
					{
						id: 1,
						title: 'Vanha kortti 1',
						description: 'Vanha kuvaus 1',
						timedEvent: false,
						targetPlayer: false,
						tags: [],
					},
					{
						id: 2,
						title: 'Vanha kortti 2',
						description: 'Vanha kuvaus 2',
						timedEvent: false,
						targetPlayer: false,
						tags: [],
					},
				],
				language: Language.FI,
			},
		};

		const newCardData = {
			[Language.EN]: {
				cards: [{
					id: 3,
					title: 'New Card',
					description: 'New Desc',
					timedEvent: true,
					targetPlayer: false,
					tags: [Tag.EVENT],
				}],
				language: Language.EN,
			},
			[Language.FI]: {
				cards: [{
					id: 3,
					title: 'Uusi kortti',
					description: 'Uusi kuvaus',
					timedEvent: true,
					targetPlayer: false,
					tags: [Tag.EVENT],
				}],
				language: Language.FI,
			},
		};

		vi.mocked(get).mockReturnValue(currentStoreData);
		vi.mocked(createCards).mockResolvedValue(newCardData);

		await loadSingleCard(1, [Tag.EVENT], []);

		expect(createCards).toHaveBeenCalledWith(1, [Tag.EVENT], []);
		expect(languageData.set).toHaveBeenCalledWith({
			[Language.EN]: {
				cards: [
					{
						id: 1,
						title: 'Old Card 1',
						description: 'Old Desc 1',
						timedEvent: false,
						targetPlayer: false,
						tags: [],
					},
					{
						id: 3,
						title: 'New Card',
						description: 'New Desc',
						timedEvent: true,
						targetPlayer: false,
						tags: [Tag.EVENT],
					},
				],
				language: Language.EN,
			},
			[Language.FI]: {
				cards: [
					{
						id: 1,
						title: 'Vanha kortti 1',
						description: 'Vanha kuvaus 1',
						timedEvent: false,
						targetPlayer: false,
						tags: [],
					},
					{
						id: 3,
						title: 'Uusi kortti',
						description: 'Uusi kuvaus',
						timedEvent: true,
						targetPlayer: false,
						tags: [Tag.EVENT],
					},
				],
				language: Language.FI,
			},
		});
	});

	it('should not update store when createCards returns null', async () => {
		vi.mocked(get).mockReturnValue(mockCardsData);
		vi.mocked(createCards).mockResolvedValue(null);

		await loadSingleCard(0, [Tag.EVENT], []);

		expect(languageData.set).not.toHaveBeenCalled();
	});

	it('should not update store when no current data exists', async () => {
		vi.mocked(get).mockReturnValue(null);

		await loadSingleCard(0, [Tag.EVENT], []);

		expect(createCards).not.toHaveBeenCalled();
		expect(languageData.set).not.toHaveBeenCalled();
	});

	it('should handle errors gracefully', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(get).mockReturnValue(mockCardsData);
		vi.mocked(createCards).mockRejectedValue(new Error('Failed'));

		await expect(loadSingleCard(0, [Tag.EVENT], [])).resolves.not.toThrow();
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
