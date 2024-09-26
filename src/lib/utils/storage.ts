import type { GameState } from '$lib/interfaces/gameState';

export function saveGameState(gameState: GameState) {
	sessionStorage.setItem('gameState', JSON.stringify(gameState));
}

export function loadGameState(): GameState | null {
	const savedState = sessionStorage.getItem('gameState');
	if (savedState) {
		try {
			return JSON.parse(savedState) as GameState;
		} catch (error) {
			console.error('Error parsing game state: ', error);
		}
	}
	return null;
}
