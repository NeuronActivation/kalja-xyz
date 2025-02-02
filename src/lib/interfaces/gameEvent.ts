/**
 * Represents an event that occurs during the game.
 */
export interface GameEvent {
	/** The title or name of the event. */
	title: string;

	/** The person associated with the event. */
	person: string;

	/** The index indicating where the event started. */
	startingIndex: number;

	/** Whether the event has ended. */
	ended: boolean;
}
