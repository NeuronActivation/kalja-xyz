import { getLocaleFromNavigator, init, register } from "svelte-i18n";

/**
 * The part of the fetch API that the locale loaders actually rely on.
 * Deliberately narrower than `typeof fetch` so that locale loading can be
 * stubbed with a plain function in tests. The global `fetch` satisfies it.
 */
export type LocaleFetch = (
  path: string,
) => Promise<{ json: () => Promise<unknown> }>;

/**
 * Registers locales for the application, making them available to the Svelte i18n library.
 * @param fetchFn The fetch function to load locale files.
 */
export function registerLocales(fetchFn: LocaleFetch) {
  register("fi", () =>
    fetchFn("/locales/finnish.json").then((res) => res.json()),
  );
  register("en", () =>
    fetchFn("/locales/english.json").then((res) => res.json()),
  );
}

// Initialize Svelte i18n with fallback locale
init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator()?.split("-")[0],
});
