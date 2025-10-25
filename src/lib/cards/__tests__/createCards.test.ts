import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCards, fetchAndFilterCards } from '$lib/cards/createCards.ts';
import { Language } from '$lib/constants/language.ts';
import { Tag } from '$lib/constants/tag.ts';
import { seededShuffle } from '$lib/utils/seed.ts';
import type { Card } from '$lib/interfaces/card.ts';

// Mock the dependencies
vi.mock('$lib/utils/seed', () => ({
	seededShuffle: vi.fn((cards) => cards), // Default to no shuffling
}));

// Mock fetch
globalThis.fetch = vi.fn();

const mockCards: Card[] = [
	{
		id: 1,
		title: { [Language.EN]: 'Card 1 EN', [Language.FI]: 'Kortti 1 FI' },
		description: { [Language.EN]: 'Desc 1 EN', [Language.FI]: 'Kuvaus 1 FI' },
		tags: [Tag.EVENT, Tag.RANDOM_TARGET],
		timedEvent: false,
		targetPlayer: false,
	},
	{
		id: 2,
		title: { [Language.EN]: 'Card 2 EN', [Language.FI]: 'Kortti 2 FI' },
		description: { [Language.EN]: 'Desc 2 EN', [Language.FI]: 'Kuvaus 2 FI' },
		tags: [Tag.EVENT],
		timedEvent: false,
		targetPlayer: false,
	},
	{
		id: 3,
		title: { [Language.EN]: 'Card 3 EN', [Language.FI]: 'Kortti 3 FI' },
		description: { [Language.EN]: 'Desc 3 EN', [Language.FI]: 'Kuvaus 3 FI' },
		tags: [],
		timedEvent: false,
		targetPlayer: false,
	},
];

describe('createCards', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(seededShuffle).mockImplementation((cards) => cards);
	});

	it('should create cards for all languages with correct structure', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			json: () => Promise.resolve({ cards: mockCards }),
		} as Response);

		const result = await createCards(2, [Tag.EVENT, Tag.CLASSIC], []);

		expect(result).not.toBeNull();
		expect(result![Language.EN].cards).toHaveLength(2);
		expect(result![Language.FI].cards).toHaveLength(2);

		expect(result![Language.EN].language).toBe(Language.EN);
		expect(result![Language.FI].language).toBe(Language.FI);

		// Check card structure
		expect(result![Language.EN].cards[0]).toEqual({
			id: 1,
			title: 'Card 1 EN',
			description: 'Desc 1 EN',
			timedEvent: true,
			targetPlayer: true,
			tags: [Tag.EVENT, Tag.RANDOM_TARGET],
		});
	});

	it('should return empty when fetching fails', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
		const result = await createCards(2, [Tag.EVENT], []);

		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toStrictEqual({
			'en': {
				'cards': [],
				'language': 'en',
			},
			'fi': {
				'cards': [],
				'language': 'fi',
			},
		});
		consoleSpy.mockRestore();
	});

	it('should limit cards to cardAmount', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			json: () => Promise.resolve({ cards: mockCards }),
		} as Response);

		const result = await createCards(1, [Tag.EVENT], []);

		expect(result![Language.EN].cards).toHaveLength(1);
		expect(result![Language.FI].cards).toHaveLength(1);
	});
});

describe('fetchAndFilterCards', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should filter cards by included tags', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			json: () => Promise.resolve({ cards: mockCards }),
		} as Response);

		const result = await fetchAndFilterCards([Tag.EVENT], [], 0.5);

		expect(result).toHaveLength(2);
		expect(result[0].id).toBe(1);
	});

	it('should include untagged cards when UNTAGGED is in includedTags', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			json: () => Promise.resolve({ cards: mockCards }),
		} as Response);

		const result = await fetchAndFilterCards([Tag.UNTAGGED], [], 0.5);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(3);
	});

	it('should exclude cards with excluded tags', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			json: () => Promise.resolve({ cards: mockCards }),
		} as Response);

		const result = await fetchAndFilterCards([Tag.EVENT], [Tag.RANDOM_TARGET], 0.5);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(2);
	});

	it('should exclude untagged cards when UNTAGGED is in excludedTags', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			json: () => Promise.resolve({ cards: mockCards }),
		} as Response);

		const result = await fetchAndFilterCards([Tag.EVENT], [Tag.UNTAGGED], 0.5);

		expect(result).toHaveLength(2);
		expect(result.map((card) => card.id)).toEqual([1, 2]);
	});

	it('should return empty array when fetch fails', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

		const result = await fetchAndFilterCards([Tag.EVENT], [], 0.5);

		expect(result).toEqual([]);
		expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch cards:', expect.any(Error));
		consoleSpy.mockRestore();
	});

	it('should shuffle cards with seed', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			json: () => Promise.resolve({ cards: mockCards }),
		} as Response);

		const shuffledCards: Card[] = [mockCards[0], mockCards[1]];

		vi.mocked(seededShuffle).mockReturnValueOnce(shuffledCards);

		const result = await fetchAndFilterCards([Tag.EVENT], [], 0.5);

		expect(seededShuffle).toHaveBeenCalledWith(expect.any(Array), 0.5);
		expect(result).toBe(shuffledCards);
	});
});
