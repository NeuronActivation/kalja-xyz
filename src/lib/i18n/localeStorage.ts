import { getLocaleFromNavigator, locale } from 'svelte-i18n';
import { Language } from '$lib/constants/language';

/**
 * Retrieves the stored language from localStorage.
 * @returns The selected language code, or the fallback language (EN) if no selection exists.
 */
export function getStoredLanguage(): Language {
	const storedLanguage = localStorage.getItem('selectedLanguage');
	if (storedLanguage) {
		return storedLanguage as Language;
	}
	// Normalize navigator locale.
	const detectedLocale = getLocaleFromNavigator()?.split('-')[0] as Language;

	// Ensure detectedLocale is a valid Language, otherwise default to English.
	return Object.values(Language).includes(detectedLocale) ? detectedLocale : Language.EN;
}

/**
 * Sets the application's language by updating localStorage and the Svelte i18n locale.
 * @param lang The language to set.
 */
export async function setLanguage(lang: Language) {
	const localeCode = lang.toString();
	if (localeCode) {
		localStorage.setItem('selectedLanguage', lang);
		await locale.set(localeCode);
	} else {
		console.error(`Unsupported language: ${lang}`);
	}
}
