import { get } from 'svelte/store';
import { Language } from '$lib/languages/language';
import { languageData } from '$lib/languages/load';
import { type Card } from '$lib/interfaces/card';

// Get card data for specific language.
export async function getCardData(lang: Language): Promise<Card[] | undefined> {
	const currentLanguageData = get(languageData);
	const cardDataForLang = currentLanguageData[lang]?.cards;

	if (!cardDataForLang) {
		console.warn(`No card data available for language: ${lang}`);
		return undefined;
	}
	return cardDataForLang;
}
