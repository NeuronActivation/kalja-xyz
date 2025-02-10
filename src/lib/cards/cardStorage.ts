import { get } from 'svelte/store';
import { Tag } from '$lib/constants/tag';
import { Language } from '$lib/constants/language';
import { type LanguageData } from '$lib/interfaces/languageData';
import { createCards } from '$lib/cards/createCards';
import { languageData } from '$lib/stores/languageData';

/**
 * Loads card data for all supported languages and stores it in the languageData store.
 * @param includedTags - Tags that the card must have at least one of to be included.
 * @param excludedTags - Tags that the card must not have any of to be included.
 * @returns The number of cards available across all languages.
 */
export async function loadCards(includedTags: Tag[], excludedTags: Tag[]): Promise<number> {
	try {
		const cardsData = await createCards(Number.MAX_SAFE_INTEGER, includedTags, excludedTags);
		if (!cardsData) {
			return 0;
		}
		languageData.set(cardsData);

		// Get the minimum length of all languages.
		return (
			Object.values(cardsData)
				.map((lang) => lang.cards?.length ?? 0)
				.reduce((min, length) => Math.min(min, length), Number.MAX_SAFE_INTEGER) || 0
		);
	} catch (error) {
		console.error('Failed to preload languages: ', error);
		return 0;
	}
}

/**
 * Loads a single card and updates the data for all languages, replacing the card at the specified index.
 * @param cardIndex The index of the card to be replaced.
 * @param includedTags - Tags that the card must have at least one of to be included.
 * @param excludedTags - Tags that the card must not have any of to be included.
 */
export async function loadSingleCard(
	cardIndex: number,
	includedTags: Tag[],
	excludedTags: Tag[]
): Promise<void> {
	try {
		const currentData = get(languageData);
		if (!currentData) return;

		// Fetch a new single card for each language.
		const newCardData = await createCards(1, includedTags, excludedTags);
		if (!newCardData) return;

		const updatedData: Record<Language, LanguageData> = { ...currentData };

		// Replace the card at cardIndex for each language.
		for (const lang of Object.values(Language)) {
			const langData = updatedData[lang];
			const newLangCard = newCardData[lang]?.cards?.[0];

			if (langData?.cards && newLangCard) {
				langData.cards[cardIndex] = newLangCard;
			}

			updatedData[lang] = { ...langData, language: lang };
		}

		languageData.set(updatedData);
	} catch (error) {
		console.error('Failed to load a single card:', error);
	}
}
