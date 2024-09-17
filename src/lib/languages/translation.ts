import { get } from 'svelte/store';
import { type Language } from '$lib/languages/language';
import { languageData } from '$lib/languages/load';
import { type Card } from '$lib/models/card';

export async function getLocale(key: string, lang: Language): Promise<string | undefined> {
	const currentLanguageData = get(languageData);
	const localeDataForLang = currentLanguageData[lang]?.locale;

	if (!localeDataForLang) {
		console.warn(`No locale data available for language: ${lang}`);
		return undefined;
	}

	const translation = localeDataForLang[key];

	if (!translation) {
		console.warn(`No translation found for key: '${key}' in language: ${lang}`);
		return undefined;
	}

	return translation;
}

export async function getCardData(lang: Language): Promise<Card[] | undefined> {
	const currentLanguageData = get(languageData);
	const cardDataForLang = currentLanguageData[lang]?.cards;

	if (!cardDataForLang) {
		console.warn(`No card data available for language: ${lang}`);
		return undefined;
	}

	return cardDataForLang;
}
