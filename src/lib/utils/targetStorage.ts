import { isBrowser } from '#lib/constants/isBrowser.ts';

const KEY_PREFIX = 'targetPlayer-';

/**
 * Retrieves the persistent target player from session storage for a given index.
 * The target player is stored under the key `targetPlayer-${index}` in session storage.
 *
 * @param index - The index of the player whose target is to be retrieved.
 * @returns The name of the target player, or `null` if no target is found.
 */
export function getPersistentTarget(index: number): string | null {
	if (isBrowser) {
		return sessionStorage.getItem(`${KEY_PREFIX}${index}`) || null;
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
		sessionStorage.setItem(`${KEY_PREFIX}${index}`, value);
	}
}

/**
 * Removes all stored target players, so a new game doesn't reuse targets from the previous one.
 */
export function clearPersistentTargets() {
	if (!isBrowser) return;

	// Iterate backwards because removing a key shifts the indexes of the following ones.
	for (let i = sessionStorage.length - 1; i >= 0; i--) {
		const key = sessionStorage.key(i);
		if (key?.startsWith(KEY_PREFIX)) {
			sessionStorage.removeItem(key);
		}
	}
}
