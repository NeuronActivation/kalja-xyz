import type { GameState } from '$lib/interfaces/gameState';
import { isBrowser } from '$lib/constants/isBrowser';

/**
 * Saves the current game state to the session storage.
 * The game state is serialized as a JSON string and stored under the key 'gameState'.
 *
 * @param gameState - The current game state to save.
 */
export function saveGameState(gameState: GameState) {
	sessionStorage.setItem('gameState', JSON.stringify(gameState));
}

/**
 * Loads the game state from session storage.
 * If the game state is found, it will be parsed from JSON and returned as an object of type `GameState`.
 * If no valid game state is found or an error occurs during parsing, `null` is returned.
 *
 * @returns The loaded game state object of type `GameState`, or `null` if no valid state is found.
 */
export function loadGameState(): GameState | null {
	const savedState = sessionStorage.getItem('gameState');
	if (savedState) {
		try {
			return JSON.parse(savedState) as GameState;
		} catch (error) {
			console.error('Error parsing game state: ', error);
		}
	}
	return null;
}

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
