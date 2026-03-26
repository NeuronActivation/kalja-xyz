import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { get } from 'svelte/store';
import { ApplicationState } from '$lib/constants/applicationState';
import { Tag } from '$lib/constants/tag';
import { gameStore } from '$lib/stores/gameStore';
import * as gameStateStorage from '$lib/gameState/gameStateStorage';
import * as cardStorage from '$lib/cards/cardStorage';
import * as gameManagers from '$lib/managers/game';
import * as createNewGameModule from '$lib/gameState/createNewGame';
import { languageStore } from '$lib/stores/languageStore';

vi.mock('$lib/gameState/gameStateStorage', () => ({
	loadGameState: vi.fn(),
	saveGameState: vi.fn(),
}));

vi.mock('$lib/cards/cardStorage', () => ({
	loadCards: vi.fn(),
	loadSingleCard: vi.fn(),
}));

vi.mock('$lib/managers/game', () => ({
	addPlayer: vi.fn(),
	removePlayer: vi.fn(),
	changeGameState: vi.fn(),
	startGame: vi.fn(),
	showNextCard: vi.fn(),
}));

vi.mock('$lib/gameState/createNewGame', () => ({
	createNewGame: vi.fn(),
}));

vi.mock('$lib/stores/languageStore', () => ({
	languageStore: {
		subscribe: vi.fn(),
		getCards: vi.fn(),
		setGameStoreUpdate: vi.fn(),
	},
}));

describe('gameStore', () => {
	const mockNewGameState = {
		state: ApplicationState.START,
		cards: [],
		cardAmount: 0,
		maxCards: 0,
		currentCardIndex: 0,
		currentPlayerIndex: 0,
		players: [],
		includedTags: [],
		excludedTags: [],
	};

	const mockGameState = {
		...mockNewGameState,
		applicationState: ApplicationState.PLAYING,
		players: [{ id: 1, name: 'Test Player', event: null }],
		currentCardIndex: 5,
		cardAmount: 10,
		maxCards: 20,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(createNewGameModule.createNewGame as Mock).mockReturnValue(mockNewGameState);
		(gameStateStorage.saveGameState as Mock).mockImplementation(() => {});
		(gameStateStorage.loadGameState as Mock).mockReturnValue(null);
		gameStore.reset();
	});

	afterEach(() => {
		gameStore.reset();
	});

	describe('initialization', () => {
		it('should initialize with default state', () => {
			const state = get(gameStore);
			expect(state).toEqual(mockNewGameState);
		});
	});

	describe('set', () => {
		it('should set the state and save it', () => {
			gameStore.set(mockGameState);

			const state = get(gameStore);
			expect(state).toEqual(mockGameState);
			expect(gameStateStorage.saveGameState).toHaveBeenCalledWith(mockGameState);
		});
	});

	describe('createNewGame', () => {
		it('should create a new game state', () => {
			expect(createNewGameModule.createNewGame).toHaveBeenCalled();
		});
	});

	describe('addPlayer', () => {
		it('should add a player', () => {
			const mockUpdatedState = {
				...mockNewGameState,
				players: [{ id: 1, name: 'New Player' }],
			};
			(gameManagers.addPlayer as Mock).mockReturnValue(mockUpdatedState);

			gameStore.addPlayer('New Player');

			expect(gameManagers.addPlayer).toHaveBeenCalledWith(mockNewGameState, 'New Player');
			expect(gameStateStorage.saveGameState).toHaveBeenCalledWith(mockUpdatedState);
		});
	});

	describe('removePlayer', () => {
		it('should remove a player', () => {
			const mockUpdatedState = { ...mockNewGameState, players: [] };
			(gameManagers.removePlayer as Mock).mockReturnValue(mockUpdatedState);

			gameStore.removePlayer(1);

			expect(gameManagers.removePlayer).toHaveBeenCalledWith(mockNewGameState, 1);
			expect(gameStateStorage.saveGameState).toHaveBeenCalledWith(mockUpdatedState);
		});
	});

	describe('setCardAmount', () => {
		it('should set card amount and save state', () => {
			gameStore.setCardAmount(15);

			const state = get(gameStore);
			expect(state.cardAmount).toBe(15);
			expect(gameStateStorage.saveGameState).toHaveBeenCalled();
		});
	});

	describe('initializeMaxCards', () => {
		it('should initialize max cards', async () => {
			(cardStorage.loadCards as Mock).mockResolvedValue(25);

			await gameStore.initializeMaxCards();

			const state = get(gameStore);
			expect(state.maxCards).toBe(25);
			expect(state.cardAmount).toBe(25);
		});
	});

	describe('startGame', () => {
		it('should start the game when cards are available', () => {
			const mockCards = ['card1', 'card2', 'card3'];
			const mockUpdatedState = { ...mockNewGameState, cards: mockCards, events: [] };

			(languageStore.getCards as Mock).mockReturnValue(mockCards);
			(gameManagers.startGame as Mock).mockReturnValue(mockUpdatedState);

			gameStore.startGame();

			expect(gameManagers.startGame).toHaveBeenCalled();
			expect(gameStateStorage.saveGameState).toHaveBeenCalledWith(mockUpdatedState);
		});

		it('should not start game when no cards are available', () => {
			(languageStore.getCards as Mock).mockReturnValue(null);

			gameStore.startGame();

			expect(gameManagers.startGame).not.toHaveBeenCalled();
		});
	});

	describe('showNextCard', () => {
		it('should show next card', () => {
			const mockUpdatedState = { ...mockNewGameState, currentCardIndex: 1 };
			(gameManagers.showNextCard as Mock).mockReturnValue(mockUpdatedState);

			gameStore.showNextCard();

			expect(gameManagers.showNextCard).toHaveBeenCalled();
			expect(gameStateStorage.saveGameState).toHaveBeenCalledWith(mockUpdatedState);
		});
	});

	describe('updateCards', () => {
		it('should update cards when available', () => {
			const mockCards = ['card1', 'card2'];
			(languageStore.getCards as Mock).mockReturnValue(mockCards);

			gameStore.updateCards();

			const state = get(gameStore);
			expect(state.cards).toEqual(mockCards);
		});

		it('should not update cards when not available', () => {
			(languageStore.getCards as Mock).mockReturnValue(null);
			const initialState = get(gameStore);

			gameStore.updateCards();

			const state = get(gameStore);
			expect(state.cards).toEqual(initialState.cards);
		});
	});

	describe('loadSavedState', () => {
		it('should load saved state when available', () => {
			(gameStateStorage.loadGameState as Mock).mockReturnValue(mockGameState);

			gameStore.loadSavedState();

			const state = get(gameStore);
			expect(state).toEqual(mockGameState);
		});

		it('should not load state when not available', () => {
			(gameStateStorage.loadGameState as Mock).mockReturnValue(null);
			const initialState = get(gameStore);

			gameStore.loadSavedState();

			const state = get(gameStore);
			expect(state).toEqual(initialState);
		});
	});

	describe('updateTags', () => {
		it('should update tags and save state', () => {
			const includedTags = [Tag.CLASSIC, Tag.EVENT];
			const excludedTags = [Tag.CREATIVE];

			gameStore.updateTags(includedTags, excludedTags);

			const state = get(gameStore);
			expect(state.includedTags).toEqual(includedTags);
			expect(state.excludedTags).toEqual(excludedTags);
			expect(gameStateStorage.saveGameState).toHaveBeenCalled();
		});
	});

	describe('reset', () => {
		it('should reset to new game state', () => {
			gameStore.set(mockGameState);
			gameStore.reset();

			const state = get(gameStore);
			expect(state).toEqual(mockNewGameState);
		});

		it('should clear the gameState key from sessionStorage', () => {
			sessionStorage.setItem('gameState', JSON.stringify(mockGameState));
			gameStore.reset();

			expect(sessionStorage.getItem('gameState')).toBeNull();
		});
	});

	describe('changeGameState', () => {
		it('should change game state and save it', () => {
			const mockUpdatedState = { ...mockNewGameState, state: ApplicationState.PLAYING };
			(gameManagers.changeGameState as Mock).mockReturnValue(mockUpdatedState);

			gameStore.changeGameState(ApplicationState.PLAYING);

			expect(gameManagers.changeGameState).toHaveBeenCalledWith(
				mockNewGameState,
				ApplicationState.PLAYING,
			);
			expect(gameStateStorage.saveGameState).toHaveBeenCalledWith(mockUpdatedState);
			const state = get(gameStore);
			expect(state).toEqual(mockUpdatedState);
		});
	});

	describe('reroll', () => {
		it('should reload single card at current index and update cards', async () => {
			const stateWithIndex = {
				...mockNewGameState,
				currentCardIndex: 2,
				includedTags: [Tag.EVENT],
				excludedTags: [Tag.CLASSIC],
			};
			gameStore.set(stateWithIndex);

			const mockCards = ['card1', 'card2'];
			(cardStorage.loadSingleCard as Mock).mockResolvedValue(undefined);
			(languageStore.getCards as Mock).mockReturnValue(mockCards);

			await gameStore.reroll();

			expect(cardStorage.loadSingleCard).toHaveBeenCalledWith(2, [Tag.EVENT], [Tag.CLASSIC]);
			const state = get(gameStore);
			expect(state.cards).toEqual(mockCards);
		});
	});

	describe('replay', () => {
		it('should reload cards with current tags and restart the game', async () => {
			const stateWithTags = {
				...mockNewGameState,
				includedTags: [Tag.EVENT],
				excludedTags: [Tag.CLASSIC],
			};
			gameStore.set(stateWithTags);

			const mockCards = ['card1', 'card2'];
			(cardStorage.loadCards as Mock).mockResolvedValue(10);
			(languageStore.getCards as Mock).mockReturnValue(mockCards);
			const mockStartedState = { ...stateWithTags, state: ApplicationState.PLAYING };
			(gameManagers.startGame as Mock).mockReturnValue(mockStartedState);

			await gameStore.replay();

			expect(cardStorage.loadCards).toHaveBeenCalledWith([Tag.EVENT], [Tag.CLASSIC]);
			expect(gameManagers.startGame).toHaveBeenCalled();
		});
	});
});
