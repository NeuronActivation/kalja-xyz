import { Tag } from '$lib/constants/tag';

/** Base interface for both Card and LanguageSpecificCard. */
interface BaseCard {
	/** The unique identifier for the card. */
	id: number;

	/** Whether the challenge lasts for the duration of the round. */
	timedEvent: boolean;

	/** Whether the card targets a specific player. */
	targetPlayer: boolean;

	/** Tags for the card. */
	tags: Tag[];
}

/** Represents localized text for a card in multiple languages. */
interface LocalizedText {
	en: string;
	fi: string;
}

/** Data structure corresponsing to "cards.json". */
export interface Card extends BaseCard {
	/** The title or name of the card. */
	title: LocalizedText;

	/** A description explaining the card's challenge. */
	description: LocalizedText;
}

/** Language specific card data. */
export interface LanguageSpecificCard extends BaseCard {
	/** The title or name of the card. */
	title: string;

	/** A description explaining the card's challenge. */
	description: string;
}
