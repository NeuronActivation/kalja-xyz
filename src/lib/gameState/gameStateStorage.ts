import { type GameState } from '$lib/interfaces/gameState';

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
			const parsed = JSON.parse(savedState);

			// Validate that it's a proper GameState object.
			if (
				parsed &&
				typeof parsed === 'object' &&
				!Array.isArray(parsed) &&
				'cards' in parsed &&
				'players' in parsed &&
				'state' in parsed &&
				'currentCardIndex' in parsed &&
				'currentPlayerIndex' in parsed &&
				'includedTags' in parsed &&
				'excludedTags' in parsed
			) {
				return parsed as GameState;
			}

			// Return null for primitives, arrays, or invalid objects
			return null;
		} catch (error) {
			console.error('Error parsing game state: ', error);
		}
	}
	return null;
}
