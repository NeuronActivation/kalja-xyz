import { isBrowser } from '$lib/constants/isBrowser.ts';

/**
 * Retrieves the persistent target player from session storage for a given index.
 * The target player is stored under the key `targetPlayer-${index}` in session storage.
 *
 * @param index - The index of the player whose target is to be retrieved.
 * @returns The name of the target player, or `null` if no target is found.
 */
export function getPersistentTarget(index: number): string | null {
	if (isBrowser) {
		return sessionStorage.getItem(`targetPlayer-${index}`) || null;
	}
	return null;
}

/**
 * Sets a persistent target player in session storage for a given index.
 * The target player is stored under the key `targetPlayer-${index}` in session storage.
 *
 * @param index - The index of the player whose target is to be set.
 * @param value - The name of the target player to store.
 */
export function setPersistentTarget(index: number, value: string) {
	if (isBrowser) {
		sessionStorage.setItem(`targetPlayer-${index}`, value);
	}
}
