import { base } from '$app/paths';

/**
 * Enum representing supported languages.
 */
export enum Language {
	FI = 'fi',
	EN = 'en'
}

/**
 * Returns the URL of the card data JSON file based on the selected language.
 *
 * @param language - The selected language.
 * @returns The URL pointing to the corresponding card JSON file.
 * @throws {Error} If the language is not supported.
 */
export function getCardUrl(language: Language): string {
	switch (language) {
		case Language.FI:
			return `${base}/cards/finnish.json`;
		case Language.EN:
			return `${base}/cards/english.json`;
		default:
			throw new Error(`Unsupported language: ${language}`);
	}
}
