import { type GameState } from '$lib/interfaces/gameState';
import { type Player } from '$lib/interfaces/player';
import { type GameEvent } from '$lib/interfaces/gameEvent';
import { cardsInGame } from '$lib/constants/cardsInGame';
import { ApplicationState } from '$lib/constants/applicationState';

export namespace game {
	// Modify state for starting the game.
	export function startGame(gameState: GameState): GameState {
		gameState.players.sort(() => Math.random() - 0.5);
		gameState.currentCardIndex = 0;
		gameState.currentPlayerIndex = 0;
		gameState = changeGameState(gameState, ApplicationState.PLAYING);
		return gameState;
	}

	// Modify state for adding a new player.
	export function addPlayer(gameState: GameState, playerName: string): GameState {
		const newPlayer: Player = { id: gameState.players.length + 1, name: playerName };
		gameState.players = [...gameState.players, newPlayer];
		return gameState;
	}

	// Modify state for removing a player.
	export function removePlayer(gameState: GameState, playerId: number): GameState {
		gameState.players = gameState.players.filter((player) => player.id !== playerId);
		return gameState;
	}

	// Modify "state" of GameState.
	export function changeGameState(gameState: GameState, newState: ApplicationState): GameState {
		gameState.state = newState;
		return gameState;
	}

	// Modify state for showing the next card in game.
	export function showNextCard(gameState: GameState): GameState {
		gameState.currentCardIndex += 1;
		gameState.currentPlayerIndex += 1;

		// Go to game over if out of cards.
		// Card index doesn't have to be updated since it's always updated in startGame().
		if (gameState.currentCardIndex >= cardsInGame) {
			// All ongoing events automatically end.
			gameState.events.forEach((event) => {
				event.ended = true;
			});
			return changeGameState(gameState, ApplicationState.GAME_OVER);
		}
		if (gameState.currentPlayerIndex >= gameState.players.length) {
			gameState.currentPlayerIndex = 0;
		}
		// Clearing ended events.
		gameState.events = gameState.events.filter((item) => !item.ended);

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

	// Get a random target for a card.
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
} // namespace game
