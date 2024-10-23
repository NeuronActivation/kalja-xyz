// src/lib/stores/languageStore.ts
import { get, writable } from "svelte/store";
import { Language } from "../languages/language";
import { setLanguage } from "../languages/load";
import { getCardData } from "../languages/translation";

function createLanguageStore() {
	const { subscribe, set, update } = writable(Language.FI);
	const store = { subscribe, set, update };

	return {
		subscribe,
		async changeLanguage(newLanguage: Language) {
			const currentLanguage = get(store);
			if (newLanguage !== currentLanguage) {
				await setLanguage(newLanguage);
				set(newLanguage);
			}
		},
		async getCards() {
			const currentLanguage = get(store);
			return await getCardData(currentLanguage);
		},
	};
}

export const languageStore = createLanguageStore();
