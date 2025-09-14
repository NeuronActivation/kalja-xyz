import { type GameEvent } from '$lib/interfaces/gameEvent';

/**
 * Represents a player in the game.
 */
export interface Player {
	/** The unique identifier for the player. */
	id: number;

	/** The name of the player. */
	name: string;

	/** Player's current event. */
	event: GameEvent | null;
}
