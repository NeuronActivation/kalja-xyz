import { writable } from 'svelte/store';
import type { GameState } from '../interfaces/gameState';
import { createNewGame } from '../interfaces/gameState';
import { game } from '../managers/game';
import { ApplicationState } from '../constants/applicationState';
import { loadGameState, saveGameState } from '../utils/storage';
import { languageStore } from './languageStore';
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
		startGame: async () => {
			await loadCards(fetch);
			const cards = await languageStore.getCards();
			if (cards) {
				update((state) => {
					state.cards = cards;
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
