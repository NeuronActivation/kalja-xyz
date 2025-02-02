/**
 * Represents a card that contains a challenge to a given player or everyone.
 */
export interface Card {
	/** The title or name of the card. */
	title: string;

	/** A description explaining the card's challenge. */
	description: string;

	/**  Whether the challenge lasts for the duration of the round. */
	timedEvent: boolean;

	/** Whether the card targets a specific player. */
	targetPlayer: boolean;
}
