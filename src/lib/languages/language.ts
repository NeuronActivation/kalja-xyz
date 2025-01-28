import { base } from '$app/paths';

export enum Language {
	FI = 'fi',
	EN = 'en'
}

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
