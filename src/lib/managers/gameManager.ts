import { loadGameState, saveGameState } from '$lib/utils/storage';
import { createNewGame } from '../interfaces/gameState';
import { type GameState } from '../interfaces/gameState';
import { ApplicationState } from '../constants/applicationState';
import { cardsInGame } from '$lib/constants/cardsInGame';
import { type Player } from '$lib/interfaces/player';
import { type GameEvent } from '$lib/interfaces/gameEvent';

export class GameManager {
	gameState: GameState;

	constructor() {
		this.gameState = createNewGame();
		const savedState = loadGameState();
		if (savedState) {
			console.debug('Loaded sessionstorage');
			this.gameState = savedState;
		}
	}

	startGame() {
		this.gameState.players.sort(() => Math.random() - 0.5);
		this.gameState.currentCardIndex = 0;
		this.gameState.currentPlayerIndex = 0;
		this.changeGameState(ApplicationState.PLAYING);
	}

	resetGame() {
		sessionStorage.removeItem('gameState');
		this.gameState = createNewGame();
	}

	addPlayer(playerName: string) {
		const newPlayer: Player = { id: this.gameState.players.length + 1, name: playerName };
		this.gameState.players = [...this.gameState.players, newPlayer];
		this.saveState();
	}

	removePlayer(playerId: number) {
		// Create a new players array to trigger reactivity
		this.gameState = {
			...this.gameState,
			players: this.gameState.players.filter((player) => player.id !== playerId)
		};
		this.saveState();
	}

	showNextCard() {
		this.gameState.currentCardIndex += 1;
		this.gameState.currentPlayerIndex += 1;

		if (this.gameState.currentCardIndex >= cardsInGame) {
			this.changeGameState(ApplicationState.GAME_OVER);
			return;
		}

		if (this.gameState.currentPlayerIndex >= this.gameState.players.length) {
			this.gameState.currentPlayerIndex = 0;
		}

		this.handleEvents();
		this.saveState();
	}

	private handleEvents() {
		this.gameState.events = this.gameState.events.filter((event) => !event.ended);

		if (this.gameState.currentCardIndex + 1 >= cardsInGame) {
			this.gameState.events.forEach((event) => (event.ended = true));
			return;
		}

		this.gameState.events.forEach((event) => {
			if (this.gameState.currentPlayerIndex === event.startingIndex) {
				event.ended = true;
			}
		});

		const currentCard = this.gameState.cards[this.gameState.currentCardIndex];
		if (currentCard.timedEvent) {
			const event: GameEvent = {
				title: currentCard.title,
				person: this.gameState.players[this.gameState.currentPlayerIndex].name,
				startingIndex: this.gameState.currentPlayerIndex,
				ended: false
			};
			this.gameState.events.push(event);
		}
	}

	changeGameState(newState: ApplicationState) {
		this.gameState.state = newState;
		this.saveState();
	}

	private saveState() {
		saveGameState(this.gameState);
	}
}
