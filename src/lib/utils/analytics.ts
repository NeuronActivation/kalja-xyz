/**
 * Analytics utility for tracking events with Umami.
 */

interface UmamiTracker {
	track: (eventName: string, eventData?: Record<string, unknown>) => void;
}

declare global {
	interface Window {
		umami?: UmamiTracker;
	}
}

/**
 * Track a custom event with Umami Analytics.
 *
 * @param eventName - The name of the event to track
 * @param eventData - Optional data to attach to the event
 *
 * @example
 * trackEvent('game-started', { players: 4 });
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
	// Check whether Umami is loaded or not
	if (typeof globalThis.window !== 'undefined' && globalThis.window.umami) {
		try {
			globalThis.window.umami.track(eventName, eventData);
		} catch (error) {
			// Silently fail
			console.warn('Failed to track event:', eventName, error);
		}
	}
}
