import { base } from '$app/paths';
import { Language } from '$lib/constants/language';
import { Tag } from '$lib/constants/tag';
import { type LanguageData } from '$lib/interfaces/languageData';
import { type Card } from '$lib/interfaces/card';
import { seededShuffle } from '$lib/utils/seed';

/**
 * Creates the card data for each language, shuffling them with a seeded random generator.
 * @param cardAmount The number of cards to retrieve for each language.
 * @param includedTags - Tags that the card must have at least one of to be included.
 * @param excludedTags - Tags that the card must not have any of to be included.
 * @returns A record of shuffled card data for each language or null if fetching fails.
 */
export async function createCards(
	cardAmount: number,
	includedTags: Tag[],
	excludedTags: Tag[],
): Promise<Record<Language, LanguageData> | null> {
	try {
		const seed = Math.random();
		const shuffledCards = await fetchAndFilterCards(includedTags, excludedTags, seed);

		// Separate required and non-required cards
		const requiredCards = shuffledCards.filter((card) => card.required);
		console.log('Required cards in createCards: ', requiredCards);
		const nonRequiredCards = shuffledCards.filter((card) => !card.required);

		// Ensure required cards are always included
		const finalSelection = [
			...requiredCards,
			...nonRequiredCards.slice(0, Math.max(0, cardAmount - requiredCards.length)),
		];

		// Initialize an empty record to store cards per language.
		const languageCards: Record<Language, LanguageData> = {} as Record<Language, LanguageData>;

		// Process all languages.
		Object.values(Language).forEach((lang) => {
			languageCards[lang] = {
				cards: finalSelection.slice(0, cardAmount).map((card) => ({
					id: card.id,
					title: card.title[lang],
					description: card.description[lang],
					timedEvent: card.tags.includes(Tag.EVENT),
					targetPlayer: card.tags.includes(Tag.RANDOM_TARGET),
					required: card.required ?? false,
					tags: card.tags,
				})),
				language: lang,
			};
		});
		return languageCards;
	} catch (error) {
		console.error('Failed to create cards:', error);
		return null;
	}
}

/**
 * Fetches, filters and shuffles cards.
 * @param includedTags - Tags that the card must have at least one of to be included.
 * @param excludedTags - Tags that the card must not have any of to be included.
 * @param seed The seed for shuffling.
 * @returns Shuffled and filtered cards.
 */
async function fetchAndFilterCards(
	includedTags: Tag[],
	excludedTags: Tag[],
	seed: number,
): Promise<Card[]> {
	try {
		const response = await fetch(`${base}/cards/cards.json`);
		const { cards }: { cards: Card[] } = await response.json();

		// Filter only cards that contain at least one of the given tags.
		// If "untagged" is selected, include cards with no tags.
		const includedCards = cards.filter(
			(card) =>
				card.tags.some((tag) => includedTags.includes(tag)) ||
				(includedTags.includes(Tag.UNTAGGED) && card.tags.length === 0),
		);

		// Exclude cards that contain at least one of the excluded tags.
		// If "untagged" is exluded, exclude cards without tags.
		const filteredCards = includedCards.filter(
			(card) =>
				!card.tags.some((tag) => excludedTags.includes(tag)) &&
				!(excludedTags.includes(Tag.UNTAGGED) && card.tags.length === 0),
		);

		return seededShuffle(filteredCards, seed);
	} catch (error) {
		console.error(`Failed to fetch cards:`, error);
		return [];
	}
}
