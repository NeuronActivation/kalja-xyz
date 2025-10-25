import { get, writable } from 'svelte/store';
import { ApplicationState } from '$lib/constants/applicationState.ts';
import type { GameState } from '$lib/interfaces/gameState.ts';
import { languageStore } from '$lib/stores/languageStore.ts';
import { Tag } from '$lib/constants/tag.ts';
import * as analytics from '$lib/utils/analytics.ts';
import { createNewGame } from '$lib/gameState/createNewGame.ts';
import { loadGameState, saveGameState } from '$lib/gameState/gameStateStorage.ts';
import { loadCards, loadSingleCard } from '$lib/cards/cardStorage.ts';
import {
	addPlayer,
	changeGameState,
	removePlayer,
	showNextCard,
	startGame,
} from '$lib/managers/game.ts';

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
 * - `updateTags`: Updates the tags where the cards are drawn from and the tags where the cards are discarded.
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
				const updatedState = changeGameState(state, newState);
				saveGameState(updatedState);
				return updatedState;
			});
		},
		addPlayer: (playerName: string) => {
			update((state) => {
				const updatedState = addPlayer(state, playerName);
				saveGameState(updatedState);
				return updatedState;
			});
		},
		removePlayer: (playerId: number) => {
			update((state) => {
				const updatedState = removePlayer(state, playerId);
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
			const { includedTags, excludedTags } = get(gameStore);
			const maxCards = await loadCards(includedTags, excludedTags);
			const cardAmount = maxCards;

			update((state) => ({
				...state,
				cardAmount,
				maxCards,
			}));
		},
		startGame: () => {
			const cards = languageStore.getCards();
			if (cards) {
				update((state) => {
					state.cards = cards;
					const updatedState = startGame(state);
					saveGameState(updatedState);
					analytics.trackEvent('players', {
						players: updatedState.players.length,
					});
					return updatedState;
				});
			}
		},
		showNextCard: () => {
			update((state) => {
				const updatedState = showNextCard(state);
				saveGameState(updatedState);
				return updatedState;
			});
		},
		updateCards: () => {
			const cards = languageStore.getCards();
			if (cards) {
				update((state) => ({
					...state,
					cards: cards,
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
			const { currentCardIndex, includedTags, excludedTags } = get(gameStore);
			await loadSingleCard(currentCardIndex, includedTags, excludedTags);
			gameStore.updateCards();
		},
		replay: async () => {
			const { includedTags, excludedTags } = get(gameStore);
			await loadCards(includedTags, excludedTags);
			gameStore.startGame();
		},
		updateTags: (includedTags: Tag[], excludedTags: Tag[]) => {
			update((state) => {
				const updatedState = { ...state, includedTags, excludedTags };
				saveGameState(updatedState);
				return updatedState;
			});
		},
	};
}

export const gameStore = createGameStore();

languageStore.setGameStoreUpdate(() => {
	gameStore.updateCards();
});
