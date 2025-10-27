import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadGameState, saveGameState } from '$lib/gameState/gameStateStorage';
import type { GameState } from '$lib/interfaces/gameState';
import { ApplicationState } from '$lib/constants/applicationState';
import { Tag } from '$lib/constants/tag';

// Mock sessionStorage
const mockSessionStorage = (() => {
	let store: { [key: string]: string } = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
})();

Object.defineProperty(window, 'sessionStorage', {
	value: mockSessionStorage,
});

describe('gameStateStorage', () => {
	beforeEach(() => {
		mockSessionStorage.clear();
		vi.clearAllMocks();
	});

	describe('saveGameState', () => {
		it('should save game state to sessionStorage', () => {
			const mockGameState: GameState = {
				cards: [],
				cardAmount: 10,
				maxCards: 20,
				currentCardIndex: 0,
				currentPlayerIndex: 0,
				state: ApplicationState.START,
				players: [
					{ id: 1, name: 'Player 1', event: null },
					{ id: 2, name: 'Player 2', event: null },
				],
				includedTags: [Tag.CLASSIC, Tag.CREATIVE],
				excludedTags: [Tag.PHYSICAL],
			};

			saveGameState(mockGameState);

			expect(sessionStorage.setItem).toHaveBeenCalledWith(
				'gameState',
				JSON.stringify(mockGameState),
			);
		});

		it('should handle empty game state', () => {
			const emptyGameState: GameState = {
				cards: [],
				cardAmount: undefined,
				maxCards: undefined,
				currentCardIndex: 0,
				currentPlayerIndex: 0,
				state: ApplicationState.START,
				players: [],
				includedTags: [],
				excludedTags: [],
			};

			saveGameState(emptyGameState);

			expect(sessionStorage.setItem).toHaveBeenCalledWith(
				'gameState',
				JSON.stringify(emptyGameState),
			);
		});
	});

	describe('loadGameState', () => {
		it('should load game state from sessionStorage when valid state exists', () => {
			const mockGameState: GameState = {
				cards: [],
				cardAmount: 10,
				maxCards: 20,
				currentCardIndex: 5,
				currentPlayerIndex: 1,
				state: ApplicationState.PLAYING,
				players: [
					{ id: 1, name: 'Player 1', event: null },
					{ id: 2, name: 'Player 2', event: null },
				],
				includedTags: [Tag.CLASSIC],
				excludedTags: [Tag.CREATIVE],
			};

			mockSessionStorage.setItem('gameState', JSON.stringify(mockGameState));

			const loadedState = loadGameState();

			expect(sessionStorage.getItem).toHaveBeenCalledWith('gameState');
			expect(loadedState).toEqual(mockGameState);
		});

		it('should return null when no game state exists in sessionStorage', () => {
			const loadedState = loadGameState();

			expect(sessionStorage.getItem).toHaveBeenCalledWith('gameState');
			expect(loadedState).toBeNull();
		});

		it('should return null and log error when JSON parsing fails', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			mockSessionStorage.setItem('gameState', 'invalid json');

			const loadedState = loadGameState();

			expect(sessionStorage.getItem).toHaveBeenCalledWith('gameState');
			expect(loadedState).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Error parsing game state: ',
				expect.any(Error),
			);

			consoleSpy.mockRestore();
		});

		it('should handle malformed JSON gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// Malformed JSON scenarios.
			const malformedJSONs = [
				'{ invalid json }',
				'undefined',
				'null',
				'{ "trailingComma": true, }',
				"'single quotes'",
				'{ unquotedKey: "value" }',
			];

			malformedJSONs.forEach((malformedJSON) => {
				mockSessionStorage.clear();
				mockSessionStorage.setItem('gameState', malformedJSON);

				const loadedState = loadGameState();
				expect(loadedState).toBeNull();
			});

			consoleSpy.mockRestore();
		});
	});

	it('should handle valid JSON primitives that are not GameState objects', () => {
		// These are valid JSON but not GameState objects, they should return null.
		const validJSONButNotGameState = [
			'123', // number
			'null', // null
			'""', // empty string
			'"hello"', // string
			'true', // boolean
			'[]', // empty array
			'{}', // empty object
			'{ "cards": []}', // incomplete GameState
		];

		validJSONButNotGameState.forEach((jsonString) => {
			mockSessionStorage.clear();
			mockSessionStorage.setItem('gameState', jsonString);

			const loadedState = loadGameState();
			expect(loadedState).toBeNull();
		});
	});
});
