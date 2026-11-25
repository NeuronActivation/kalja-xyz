import { describe, expect, it } from 'vitest';
import { shuffle } from '#lib/utils/shuffle.ts';

const range = (length: number) => Array.from({ length }, (_, i) => i);

describe('shuffle', () => {
	it('shuffles in place and returns the same array', () => {
		const array = range(10);
		expect(shuffle(array)).toBe(array);
	});

	it('keeps every item exactly once', () => {
		const result = shuffle(range(50));
		expect([...result].sort((a, b) => a - b)).toEqual(range(50));
	});

	it('handles empty and single item arrays', () => {
		expect(shuffle([])).toEqual([]);
		expect(shuffle(['only'])).toEqual(['only']);
	});

	it('uses the given random function', () => {
		// Always picking the lowest index rotates the array left by one.
		expect(shuffle(range(5), () => 0)).toEqual([1, 2, 3, 4, 0]);
		// Always picking the current index leaves the array as it is.
		expect(shuffle(range(5), () => 0.999999)).toEqual(range(5));
	});

	it('can move any item to any position', () => {
		const seenInLastSlot = new Set<number>();
		for (let i = 0; i < 500; i++) {
			seenInLastSlot.add(shuffle(range(5)).at(-1)!);
		}
		expect(seenInLastSlot).toEqual(new Set(range(5)));
	});
});
