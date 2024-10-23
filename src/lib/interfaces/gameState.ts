import { ApplicationState } from '$lib/constants/applicationState';
import { type Card } from '$lib/interfaces/card';
import { type GameEvent } from '$lib/interfaces/gameEvent';
import { type Player } from '$lib/interfaces/player';

export interface GameState {
	cards: Card[];
	playerName: string;
	currentCardIndex: number;
	currentPlayerIndex: number;
	state: ApplicationState;
	players: Player[];
	events: GameEvent[];
}

export function createNewGame(): GameState {
	return {
		cards: [],
		playerName: '',
		currentCardIndex: 0,
		currentPlayerIndex: 0,
		state: ApplicationState.START,
		players: [],
		events: []
	};
}
