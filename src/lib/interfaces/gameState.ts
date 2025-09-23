import { ApplicationState } from '$lib/constants/applicationState';
import { type LanguageSpecificCard } from '$lib/interfaces/card';
import { type Player } from '$lib/interfaces/player';
import { Tag } from '$lib/constants/tag';

/**
 * Represents the state of the game at a given moment.
 */
export interface GameState {
	/** The current state of the game. */
	state: ApplicationState;

	/** The list of cards in the game. */
	cards: LanguageSpecificCard[];

	/** The number of cards available in the game. Must be explicitly initialized using `initializeMaxCards`. */
	cardAmount: number | undefined;

	/** The maximum number of cards allowed in the game. Must be explicitly initialized using `initializeMaxCards`. */
	maxCards: number | undefined;

	/** The index of the currently active card. */
	currentCardIndex: number;

	/** The index of the current player in the turn order. */
	currentPlayerIndex: number;

	/** The list of players in the game. */
	players: Player[];

	/** Tags that determine where the cards are included from. All tags are enabled by default. */
	includedTags: Tag[];

	/** Tags that determine which cards are filtered out. */
	excludedTags: Tag[];
}
