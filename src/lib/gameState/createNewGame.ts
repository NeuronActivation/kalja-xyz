import { ApplicationState } from '$lib/constants/applicationState';
import { Tag } from '$lib/constants/tag';
import { type GameState } from '$lib/interfaces/gameState';

/**
 * Creates a new game state with default values.
 *
 * - `cardAmount` and `maxCards` are `undefined` and **must be explicitly set** using the `initializeMaxCards` function.
 * - All other properties are initialized with default values.
 *
 * @returns A new `GameState` instance with default values.
 */
export function createNewGame(): GameState {
	return {
		cards: [],
		cardAmount: undefined,
		maxCards: undefined,
		currentCardIndex: 0,
		currentPlayerIndex: 0,
		state: ApplicationState.START,
		players: [],
		events: [],
		includedTags: Object.values(Tag),
		excludedTags: [],
	};
}
