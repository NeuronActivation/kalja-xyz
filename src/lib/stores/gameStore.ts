import { get, writable } from 'svelte/store';
import type { GameState } from '$lib/interfaces/gameState';
import { createNewGame } from '$lib/interfaces/gameState';
import { game } from '$lib/managers/game';
import { ApplicationState } from '$lib/constants/applicationState';
import { loadGameState, saveGameState } from '$lib/utils/storage';
import { languageStore } from '$lib/stores/languageStore';
import { loadCards, loadSingleCard } from '$lib/languages/load';
import { Tag } from '$lib/constants/tag';

/**
 * Creates a writable store to manage the game state and provides several actions
 * for manipulating the game state such as adding/removing players, changing the
 * game state, starting the game, updating cards, etc. The game state is saved to
 * sessionStorage to persist between page reloads.
 *
 * The store provides the following actions:
 * - `set`: Set the game state and save it to storage.
 * - `reset`: Reset the game state to its initial state and clear the saved state.
 * - `changeGameState`: Change the game state to a new application state and save it.
 * - `addPlayer`: Add a player to the game and save the new state.
 * - `removePlayer`: Remove a player by ID and save the new state.
 * - `setCardAmount`: Set the number of cards in the game and save the new state.
 * - `initializeMaxCards`: Check how many cards can exist in the game and set the amount in the game state.
 * - `startGame`: Start the game and save the updated state.
 * - `showNextCard`: Show the next card in the game and save the new state.
 * - `updateCards`: Update the cards in the game and save the new state.
 * - `loadSavedState`: Load the saved game state from sessionStorage.
 * - `reroll`: Reload a single card and update the game state.
 * - `replay`: Reload cards and restart the game.
 * - `updateSelectedTags`: Updates the tags where the cards are gotten from.
 */
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
			const { selectedTags } = get(gameStore);
			const maxCards = await loadCards(selectedTags);
			if (maxCards) {
				update((state) => ({
					...state,
					maxCards
				}));
			}
		},
		startGame: async () => {
			const cards = await languageStore.getCards();
			if (cards) {
				update((state) => {
					state.cards = cards;
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
		},
		reroll: async () => {
			const { currentCardIndex, selectedTags } = get(gameStore);
			await loadSingleCard(currentCardIndex, selectedTags);
			await gameStore.updateCards();
		},
		replay: async () => {
			const { selectedTags } = get(gameStore);
			await loadCards(selectedTags);
			await gameStore.startGame();
		},
		updateSelectedTags: (selectedTags: Tag[]) => {
			update((state) => {
				const updatedState = { ...state, selectedTags };
				saveGameState(updatedState);
				return updatedState;
			});
		}
	};
}

export const gameStore = createGameStore();

languageStore.setGameStoreUpdate(() => {
	gameStore.updateCards();
});
