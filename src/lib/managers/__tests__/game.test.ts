import { beforeEach, describe, expect, it } from 'vitest';
import { ApplicationState } from '$lib/constants/applicationState.ts';
import {
	addPlayer,
	changeGameState,
	removePlayer,
	showNextCard,
	startGame,
} from '$lib/managers/game.ts';
import type { GameState } from '$lib/interfaces/gameState.ts';

describe('Game Manager Functions', () => {
	let mockGameState: GameState;

	beforeEach(() => {
		mockGameState = {
			state: ApplicationState.START,
			players: [
				{ id: 1, name: 'Player 1', event: null },
				{ id: 2, name: 'Player 2', event: null },
				{ id: 3, name: 'Player 3', event: null },
			],
			cards: [
				{
					id: 1,
					title: 'Card 1',
					description: 'Description 1',
					timedEvent: false,
					targetPlayer: false,
					tags: [],
				},
				{
					id: 2,
					title: 'Card 2',
					description: 'Description 2',
					timedEvent: true,
					targetPlayer: true,
					tags: [],
				},
				{
					id: 3,
					title: 'Card 3',
					description: 'Description 3',
					timedEvent: false,
					targetPlayer: true,
					tags: [],
				},
			],
			cardAmount: 3,
			currentCardIndex: 0,
			currentPlayerIndex: 0,
			maxCards: 10,
			includedTags: [],
			excludedTags: [],
		};
	});

	describe('startGame', () => {
		it('should shuffle players and reset game state', () => {
			const originalPlayerOrder = [...mockGameState.players];

			const result = startGame(mockGameState);

			expect(result.state).toBe(ApplicationState.PLAYING);
			expect(result.currentCardIndex).toBe(0);
			expect(result.currentPlayerIndex).toBe(0);
			expect(result.players).toHaveLength(originalPlayerOrder.length);
			// Check that all players are still present
			originalPlayerOrder.forEach((player) => {
				expect(result.players).toContainEqual(player);
			});
		});

		it('should handle empty players array', () => {
			const emptyState: GameState = {
				...mockGameState,
				players: [],
			};

			const result = startGame(emptyState);

			expect(result.state).toBe(ApplicationState.PLAYING);
			expect(result.currentCardIndex).toBe(0);
			expect(result.currentPlayerIndex).toBe(0);
			expect(result.players).toHaveLength(0);
		});
	});

	describe('addPlayer', () => {
		it('should add a new player with correct id', () => {
			const newPlayerName = 'New Player';

			const result = addPlayer(mockGameState, newPlayerName);

			expect(result.players).toHaveLength(4);
			expect(result.players[3]).toEqual({
				id: 4, // players.length + 1 (3 + 1)
				name: newPlayerName,
				event: null,
			});
		});

		it('should add player to empty players array', () => {
			const emptyState: GameState = {
				...mockGameState,
				players: [],
			};

			const result = addPlayer(emptyState, 'First Player');

			expect(result.players).toHaveLength(1);
			expect(result.players[0]).toEqual({
				id: 1, // players.length + 1 (0 + 1)
				name: 'First Player',
				event: null,
			});
		});

		it('should not modify existing players', () => {
			const originalPlayers = [...mockGameState.players];

			const result = addPlayer(mockGameState, 'New Player');

			// Original players should remain unchanged
			originalPlayers.forEach((player) => {
				expect(result.players).toContainEqual(player);
			});
		});
	});

	describe('removePlayer', () => {
		it('should remove player by id', () => {
			const playerToRemoveId = 2;

			const result = removePlayer(mockGameState, playerToRemoveId);

			expect(result.players).toHaveLength(2);
			expect(result.players.find((p) => p.id === playerToRemoveId)).toBeUndefined();
			expect(result.players.map((p) => p.id)).toEqual([1, 3]);
		});

		it('should return same state when removing non-existent player', () => {
			const nonExistentId = 999;
			const originalPlayers = [...mockGameState.players];

			const result = removePlayer(mockGameState, nonExistentId);

			expect(result.players).toEqual(originalPlayers);
		});

		it('should handle empty players array', () => {
			const emptyState: GameState = {
				...mockGameState,
				players: [],
			};

			const result = removePlayer(emptyState, 1);

			expect(result.players).toHaveLength(0);
		});
	});

	describe('changeGameState', () => {
		it('should change the game state', () => {
			const newState = ApplicationState.ENDING;

			const result = changeGameState(mockGameState, newState);

			expect(result.state).toBe(newState);
		});

		it('should not modify other properties', () => {
			const originalGameState = { ...mockGameState };

			const result = changeGameState(mockGameState, ApplicationState.PLAYING);

			expect(result.players).toEqual(originalGameState.players);
			expect(result.cards).toEqual(originalGameState.cards);
			expect(result.currentCardIndex).toBe(originalGameState.currentCardIndex);
			expect(result.currentPlayerIndex).toBe(originalGameState.currentPlayerIndex);
		});
	});

	describe('showNextCard', () => {
		it('should advance to next card and player', () => {
			const testState = JSON.parse(JSON.stringify(mockGameState));
			const result = showNextCard(testState);

			expect(result.currentCardIndex).toBe(1);
			expect(result.currentPlayerIndex).toBe(1);
		});

		it('should wrap player index when reaching end', () => {
			const stateAtLastPlayer: GameState = JSON.parse(JSON.stringify({
				...mockGameState,
				currentPlayerIndex: 2, // Last player index
				cards: mockGameState.cards.map((card) => ({ ...card, timedEvent: false })),
			}));

			const result = showNextCard(stateAtLastPlayer);

			expect(result.currentCardIndex).toBe(1);
			expect(result.currentPlayerIndex).toBe(0); // Wrapped around
		});

		it('should end game when no more cards', () => {
			const stateAtLastCard: GameState = JSON.parse(JSON.stringify({
				...mockGameState,
				currentCardIndex: 2, // Last card (index 2 of 3 cards)
				cardAmount: 3,
				cards: mockGameState.cards.map((card) => ({ ...card, timedEvent: false })),
			}));

			const result = showNextCard(stateAtLastCard);

			expect(result.state).toBe(ApplicationState.ENDING);
			expect(result.currentCardIndex).toBe(3); // Incremented beyond card amount
		});

		it('should clear all player events when game ends', () => {
			const stateWithEvents: GameState = JSON.parse(JSON.stringify({
				...mockGameState,
				currentCardIndex: 2,
				cardAmount: 3,
				players: [
					{
						id: 1,
						name: 'Player 1',
						event: {
							title: 'Event 1',
							person: 'Player 1',
							startingIndex: 0,
							ended: false,
						},
					},
					{
						id: 2,
						name: 'Player 2',
						event: {
							title: 'Event 2',
							person: 'Player 2',
							startingIndex: 1,
							ended: false,
						},
					},
				],
			}));

			const result = showNextCard(stateWithEvents);

			result.players.forEach((player) => {
				expect(player.event).toBeNull();
			});
		});

		it('should handle event updates for timed events', () => {
			const stateWithTimedEventCard: GameState = JSON.parse(JSON.stringify({
				...mockGameState,
				currentCardIndex: 0,
				currentPlayerIndex: 0,
				cards: [
					{
						id: 1,
						title: 'Card 1',
						description: 'Desc 1',
						timedEvent: true,
						targetPlayer: false,
						tags: [],
					},
					{
						id: 2,
						title: 'Card 2',
						description: 'Desc 2',
						timedEvent: true,
						targetPlayer: false,
						tags: [],
					},
					{
						id: 3,
						title: 'Card 3',
						description: 'Desc 3',
						timedEvent: false,
						targetPlayer: false,
						tags: [],
					},
				],
			}));

			const result = showNextCard(stateWithTimedEventCard);

			expect(result.currentCardIndex).toBe(1);
			expect(result.currentPlayerIndex).toBe(1);

			expect(result.players[0].event).toEqual({
				title: 'Card 1',
				person: 'Player 1',
				startingIndex: 0,
				ended: false,
			});

			expect(result.players[1].event).toBeNull();
		});

		it('should clear previous event for current player', () => {
			const stateWithExistingEvent: GameState = {
				...mockGameState,
				players: [
					{
						id: 1,
						name: 'Player 1',
						event: {
							title: 'Old Event',
							person: 'Player 1',
							startingIndex: 0,
							ended: false,
						},
					},
					{ id: 2, name: 'Player 2', event: null },
					{ id: 3, name: 'Player 3', event: null },
				],
			};

			const result = showNextCard(stateWithExistingEvent);

			// Previous event for player 1 should be cleared
			expect(result.players[0].event).toBeNull();
		});
	});

	// TODO getTarget()
});
