import type { GameState } from '$lib/interfaces/gameState';
import { isBrowser } from '$lib/constants/isBrowser';

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

export function getPersistentTarget(index: number): string | null {
	if (isBrowser) {
		return localStorage.getItem(`targetPlayer-${index}`) || null;
	}
	return null;
}

export function setPersistentTarget(index: number, value: string) {
	if (isBrowser) {
		localStorage.setItem(`targetPlayer-${index}`, value);
	}
}
