import { get, writable } from 'svelte/store';
import type { GameState } from '$lib/interfaces/gameState';
import { createNewGame } from '$lib/interfaces/gameState';
import { game } from '$lib/managers/game';
import { ApplicationState } from '$lib/constants/applicationState';
import { loadGameState, saveGameState } from '$lib/utils/storage';
import { languageStore } from '$lib/stores/languageStore';
import { loadCards } from '$lib/languages/load';

function createGameStore() {
	const { subscribe, set, update } = writable<GameState>(createNewGame());

	return {
		subscribe,
		set: (state: GameState) => {
			saveGameState(state);
			set(state);
		},
		reset: () => {
			const newState = createNewGame();
			sessionStorage.removeItem('gameState');
			set(newState);
		},
		changeGameState: (newState: ApplicationState) => {
			update((state) => {
				const updatedState = game.changeGameState(state, newState);
				saveGameState(updatedState);
				return updatedState;
			});
		},
		addPlayer: (playerName: string) => {
			update((state) => {
				const updatedState = game.addPlayer(state, playerName);
				saveGameState(updatedState);
				return updatedState;
			});
		},
		removePlayer: (playerId: number) => {
			update((state) => {
				const updatedState = game.removePlayer(state, playerId);
				saveGameState(updatedState);
				return updatedState;
			});
		},
		setCardAmount: (amount: number) => {
			update((state) => {
				const updatedState = { ...state, cardAmount: amount };
				saveGameState(updatedState);
				return updatedState;
			});
		},
		initializeMaxCards: async () => {
			const maxCards = await loadCards(fetch, get(gameStore).cardAmount);
			if (maxCards) {
				update((state) => ({
					...state,
					maxCards
				}));
			}
		},
		startGame: async () => {
			const maxCards = await loadCards(fetch, get(gameStore).cardAmount);
			const cards = await languageStore.getCards();
			if (cards) {
				update((state) => {
					state.cards = cards;
					state.maxCards = maxCards;
					state.events = [];
					const updatedState = game.startGame(state);
					saveGameState(updatedState);
					return updatedState;
				});
			}
		},
		showNextCard: () => {
			update((state) => {
				const updatedState = game.showNextCard(state);
				saveGameState(updatedState);
				return updatedState;
			});
		},
		updateCards: async () => {
			const cards = await languageStore.getCards();
			if (cards) {
				update((state) => ({
					...state,
					cards: cards
				}));
			}
		},
		loadSavedState: () => {
			const savedState = loadGameState();
			if (savedState) {
				set(savedState);
			}
		}
	};
}

export const gameStore = createGameStore();
