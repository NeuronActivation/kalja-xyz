import { ApplicationState } from '$lib/constants/applicationState';
import { type Card } from '$lib/interfaces/card';
import { type GameEvent } from '$lib/interfaces/gameEvent';
import { type Player } from '$lib/interfaces/player';

/**
 * Represents the state of the game at a given moment.
 */
export interface GameState {
	/** The list of cards in the game. */
	cards: Card[];

	/** The number of cards available in the game. Defaults to 30. */
	cardAmount: number;

	/** The maximum number of cards allowed in the game. Must be explicitly initialized using `initializeMaxCards`. */
	maxCards: number | undefined;

	/** The index of the currently active card. */
	currentCardIndex: number;

	/** The index of the current player in the turn order. */
	currentPlayerIndex: number;

	/** The current state of the game. */
	state: ApplicationState;

	/** The list of players in the game. */
	players: Player[];

	/** The list of events currently active in the game. */
	events: GameEvent[];
}

/**
 * Creates a new game state with default values.
 *
 * - `cardAmount` is initialized to `30`.
 * - `maxCards` is `undefined` and **must be explicitly set** using the `initializeMaxCards` function.
 * - All other properties are initialized with default values.
 *
 * @returns A new `GameState` instance with default values.
 */
export function createNewGame(): GameState {
	return {
		cards: [],
		cardAmount: 30,
		maxCards: undefined,
		currentCardIndex: 0,
		currentPlayerIndex: 0,
		state: ApplicationState.START,
		players: [],
		events: []
	};
}
