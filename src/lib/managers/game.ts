import { type GameState } from '$lib/interfaces/gameState';
import { type Player } from '$lib/interfaces/player';
import { type GameEvent } from '$lib/interfaces/gameEvent';
import { ApplicationState } from '$lib/constants/applicationState';

/**
 * Starts the game by shuffling players and setting initial game states.
 * Resets the card and player indexes and sets the game state to `PLAYING`.
 *
 * @param gameState - The current state of the game.
 * @returns The updated game state with shuffled players and the game set to `PLAYING`.
 */
export function startGame(gameState: GameState): GameState {
	gameState.players.sort(() => Math.random() - 0.5);
	gameState.currentCardIndex = 0;
	gameState.currentPlayerIndex = 0;
	gameState = changeGameState(gameState, ApplicationState.PLAYING);
	return gameState;
}

/**
 * Adds a new player to the game.
 * Creates a player object with a unique ID and the provided name, then adds it to the players list.
 *
 * @param gameState - The current state of the game.
 * @param playerName - The name of the player to add.
 * @returns The updated game state with the new player added.
 */
export function addPlayer(gameState: GameState, playerName: string): GameState {
	const newPlayer: Player = {
		id: gameState.players.length + 1,
		name: playerName,
	};
	gameState.players = [...gameState.players, newPlayer];
	return gameState;
}

/**
 * Removes a player from the game by their unique ID.
 * Filters the players array to remove the player with the matching ID.
 *
 * @param gameState - The current state of the game.
 * @param playerId - The ID of the player to remove.
 * @returns The updated game state with the player removed.
 */
export function removePlayer(gameState: GameState, playerId: number): GameState {
	gameState.players = gameState.players.filter((player) => player.id !== playerId);
	return gameState;
}

/**
 * Changes the state of the game.
 * Sets the game state to the specified `newState`.
 *
 * @param gameState - The current state of the game.
 * @param newState - The new state to set for the game.
 * @returns The modified game state with the new game state.
 */
export function changeGameState(gameState: GameState, newState: ApplicationState): GameState {
	gameState.state = newState;
	return gameState;
}

/**
 * Moves to the next card and player in the game.
 * If there are no more cards, the game transitions to the `ENDING` state.
 * Also handles the completion of ongoing events and triggers new events.
 *
 * @param gameState - The current state of the game.
 * @returns The updated game state with the next card, player, and event status.
 */
export function showNextCard(gameState: GameState): GameState {
	gameState = updateEvents(gameState);
	gameState.currentCardIndex += 1;
	gameState.currentPlayerIndex += 1;

	if (gameState.currentPlayerIndex >= gameState.players.length) {
		gameState.currentPlayerIndex = 0;
	}

	// Go to game over if out of cards.
	// Card index doesn't have to be updated since it's always updated in startGame().
	if (gameState.currentCardIndex >= (gameState.cardAmount ?? 0)) {
		// All ongoing events automatically end.
		gameState.events.forEach((event) => {
			event.ended = true;
		});
		gameState.endingEvent = null;
		return changeGameState(gameState, ApplicationState.ENDING);
	}
	return gameState;
}

export function updateEvents(gameState: GameState): GameState {
	// Event ends normally.
	const oldEndedEvent = gameState.endingEvent;
	const checkIndex = gameState.currentPlayerIndex > 0
		? gameState.currentPlayerIndex - 1
		: gameState.players.length - 1;
	gameState.events.forEach((event) => {
		if (checkIndex === event.startingIndex) {
			gameState.endingEvent = event;
			event.ended = true;
		}
	});

	// Mark the last ended event as null if there is no new ending event.
	if (oldEndedEvent && gameState.endingEvent === oldEndedEvent) {
		gameState.endingEvent = null;
	}

	// Clearing ended events.
	gameState.events = gameState.events.filter((item) => !item.ended);

	// Add a new event.
	if (gameState.cards[gameState.currentCardIndex].timedEvent) {
		const event: GameEvent = {
			title: gameState.cards[gameState.currentCardIndex].title,
			person: gameState.players[gameState.currentPlayerIndex].name,
			startingIndex: gameState.currentPlayerIndex,
			ended: false,
		};
		gameState.events.push(event);
	}
	return gameState;
}

/**
 * Gets a random target player for the current card.
 * Ensures that the current player is not selected as the target.
 *
 * @param gameState - The current state of the game.
 * @returns The name of the target player, or an empty string if no target is specified.
 */
export function getTarget(gameState: GameState): string {
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
