import { type GameState } from '$lib/interfaces/gameState';
import { type Player } from '$lib/interfaces/player';
import { type GameEvent } from '$lib/interfaces/gameEvent';
import { cardsInGame } from '$lib/constants/cardsInGame';
import { ApplicationState } from '$lib/constants/applicationState';

export function managerStartGame(gameState: GameState): GameState {
	gameState.players.sort(() => Math.random() - 0.5);
	gameState.currentCardIndex = 0;
	gameState.currentPlayerIndex = 0;
	gameState = managerChangeGameState(gameState, ApplicationState.PLAYING);
	return gameState;
}

export function managerAddPlayer(gameState: GameState, playerName: string): GameState {
	const newPlayer: Player = { id: gameState.players.length + 1, name: playerName };
	gameState.players = [...gameState.players, newPlayer];
	return gameState;
}

export function managerRemovePlayer(gameState: GameState, playerId: number): GameState {
	gameState.players = gameState.players.filter((player) => player.id !== playerId);
	return gameState;
}

export function managerChangeGameState(
	gameState: GameState,
	newState: ApplicationState
): GameState {
	gameState.state = newState;
	return gameState;
}

export function managerShowNextCard(gameState: GameState): GameState {
	gameState.currentCardIndex += 1;
	gameState.currentPlayerIndex += 1;

	// Go to game over if out of cards.
	// Card index doesn't have to be updated since it's always updated in startGame().
	if (gameState.currentCardIndex >= cardsInGame) {
		gameState = managerChangeGameState(gameState, ApplicationState.GAME_OVER);
	}
	if (gameState.currentPlayerIndex >= gameState.players.length) {
		gameState.currentPlayerIndex = 0;
	}
	// Clearing ended events.
	gameState.events = gameState.events.filter((item) => !item.ended);

	// Last card so all events automatically end.
	if (gameState.currentCardIndex + 1 >= cardsInGame) {
		gameState.events.forEach((event) => {
			event.ended = true;
		});
	}
	// Event ends normally.
	gameState.events.forEach((event) => {
		if (gameState.currentPlayerIndex === event.startingIndex) {
			event.ended = true;
		}
	});
	// Add a new event.
	if (gameState.cards[gameState.currentCardIndex].timedEvent) {
		let event: GameEvent = {
			title: gameState.cards[gameState.currentCardIndex].title,
			person: gameState.players[gameState.currentPlayerIndex].name,
			startingIndex: gameState.currentPlayerIndex,
			ended: false
		};
		gameState.events.push(event);
	}
	return gameState;
}

export function managerGetTarget(gameState: GameState): string {
	const cardIndex = gameState.currentCardIndex;
	const playerIndex = gameState.currentPlayerIndex;
	const card = gameState.cards[cardIndex];

	if (!card.targetPlayer) {
		return '';
	}

	let randomIndex = playerIndex;
	while (randomIndex === playerIndex) {
		randomIndex = Math.floor(Math.random() * gameState.players.length);
	}
	return gameState.players[randomIndex].name;
}
