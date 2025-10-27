import { describe, expect, it } from 'vitest';
import { createNewGame } from '$lib/gameState/createNewGame';
import { ApplicationState } from '$lib/constants/applicationState';
import { Tag } from '$lib/constants/tag';

describe('createNewGame', () => {
	it('should return a new game state with default values', () => {
		const newGame = createNewGame();

		expect(newGame).toEqual({
			cards: [],
			cardAmount: undefined,
			maxCards: undefined,
			currentCardIndex: 0,
			currentPlayerIndex: 0,
			state: ApplicationState.START,
			players: [],
			includedTags: Object.values(Tag),
			excludedTags: [],
		});
	});

	it('should have cardAmount and maxCards as undefined', () => {
		const newGame = createNewGame();

		expect(newGame.cardAmount).toBeUndefined();
		expect(newGame.maxCards).toBeUndefined();
	});

	it('should initialize currentCardIndex to 0', () => {
		const newGame = createNewGame();
		expect(newGame.currentCardIndex).toBe(0);
	});

	it('should initialize currentPlayerIndex to 0', () => {
		const newGame = createNewGame();
		expect(newGame.currentPlayerIndex).toBe(0);
	});

	it('should set state to ApplicationState.START', () => {
		const newGame = createNewGame();
		expect(newGame.state).toBe(ApplicationState.START);
	});

	it('should initialize players as empty array', () => {
		const newGame = createNewGame();
		expect(newGame.players).toEqual([]);
	});

	it('should include all tags in includedTags', () => {
		const newGame = createNewGame();
		expect(newGame.includedTags).toEqual(Object.values(Tag));
	});

	it('should initialize excludedTags as empty array', () => {
		const newGame = createNewGame();
		expect(newGame.excludedTags).toEqual([]);
	});

	it('should return a new object instance each time', () => {
		const game1 = createNewGame();
		const game2 = createNewGame();

		expect(game1).not.toBe(game2); // Different references
		expect(game1).toEqual(game2); // Same content
	});
});
