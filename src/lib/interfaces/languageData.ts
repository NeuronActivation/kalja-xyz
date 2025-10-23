import { type LanguageSpecificCard } from '$lib/interfaces/card';
import { Language } from '$lib/constants/language';

/**
 * Represents the data associated with a language, including the cards and a language code.
 */
export interface LanguageData {
	cards: LanguageSpecificCard[];
	language: Language;
}
