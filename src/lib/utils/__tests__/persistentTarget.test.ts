import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/constants/isBrowser', () => ({
	isBrowser: true, // default: browser environment
}));

// Mock sessionStorage in a browser-like way.
const storage = new Map<string, string>();

// Provide a mock implementation of sessionStorage.
Object.defineProperty(globalThis, 'sessionStorage', {
	value: {
		getItem: vi.fn((key: string) => storage.get(key) ?? null),
		setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
		clear: vi.fn(() => storage.clear()),
	},
	writable: true,
});

import { getPersistentTarget, setPersistentTarget } from '$lib/utils/targetStorage.ts';

describe('getPersistentTarget & setPersistentTarget', () => {
	beforeEach(() => {
		storage.clear();
		vi.clearAllMocks();
	});

	it('returns null if no value is stored', () => {
		expect(getPersistentTarget(1)).toBeNull();
	});

	it('stores and retrieves a value for a given index', () => {
		setPersistentTarget(2, 'Matti');
		const result = getPersistentTarget(2);

		expect(result).toBe('Matti');
		expect(sessionStorage.setItem).toHaveBeenCalledWith('targetPlayer-2', 'Matti');
		expect(sessionStorage.getItem).toHaveBeenCalledWith('targetPlayer-2');
	});

	it('returns null when not in browser (isBrowser = false)', async () => {
		// Reset modules cache so re-mocking works.
		vi.resetModules();

		// Override our mock isBrowser.
		vi.doMock('$lib/constants/isBrowser', () => ({ isBrowser: false }));

		// We need to re-import the functions under the new mock.
		const {
			getPersistentTarget: getPersistentTargetNoBrowser,
			setPersistentTarget: setPersistentTargetNoBrowser,
		} = await import('$lib/utils/targetStorage.ts');

		// Clear any previous calls.
		storage.clear();
		vi.clearAllMocks();

		setPersistentTargetNoBrowser(3, 'Teppo'); // should do nothing
		const result = getPersistentTargetNoBrowser(3);

		expect(result).toBeNull();
		expect(sessionStorage.getItem).not.toHaveBeenCalled();

		vi.resetModules();
		vi.doMock('$lib/constants/isBrowser', () => ({ isBrowser: true }));
	});
});
