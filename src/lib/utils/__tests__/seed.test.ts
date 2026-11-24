import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSeed, seededRandom, seededShuffle } from '$lib/utils/seed';

const range = (length: number) => Array.from({ length }, (_, i) => i);

describe('seededShuffle', () => {
	it('shuffles in place and returns the same array', () => {
		const array = range(10);
		expect(seededShuffle(array, 42)).toBe(array);
	});

	it('is deterministic for the same seed', () => {
		expect(seededShuffle(range(10), 123)).toEqual(seededShuffle(range(10), 123));
	});

	it('produces a different order for different seeds', () => {
		expect(seededShuffle(range(15), 1)).not.toEqual(seededShuffle(range(15), 2));
	});

	it('handles empty and single item arrays', () => {
		expect(seededShuffle([], 999)).toEqual([]);
		expect(seededShuffle(['only'], 999)).toEqual(['only']);
	});

	it('returns a permutation for large and negative seeds', () => {
		for (const seed of [2147483647, -2147483647, 2 ** 40]) {
			const result = seededShuffle(range(8), seed);
			expect([...result].sort((a, b) => a - b)).toEqual(range(8));
		}
	});

	it('does not lose items or leave empty slots with fractional seeds', () => {
		// Regression: a seed from Math.random() could make the state smaller than 1, so the
		// generator returned a negative number and the shuffle read array[-1].
		for (const seed of [0.00001, 0.5, 0.99, 1.5]) {
			const result = seededShuffle(range(20), seed);
			expect(result).toHaveLength(20);
			expect([...result].sort((a, b) => a - b)).toEqual(range(20));
		}
	});

	it('can move the first item to any position', () => {
		// Seeds spread across the full range, like the ones createSeed returns. Small seeds
		// (including every Math.random() seed) make the first draw close to 0, which always
		// moved the first item last.
		const positions = new Set<number>();
		for (let k = 0; k < 200; k++) {
			positions.add(seededShuffle(range(5), 1 + k * 10_000_019).indexOf(0));
		}
		expect(positions).toEqual(new Set(range(5)));
	});
});

describe('seededRandom', () => {
	it('generates numbers in [0, 1) and is deterministic per seed', () => {
		const a = seededRandom(500);
		const b = seededRandom(500);
		const sequence = range(100).map(() => a());

		expect(range(100).map(() => b())).toEqual(sequence);
		for (const value of sequence) {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it('generates a different sequence for a different seed', () => {
		const a = seededRandom(500);
		const b = seededRandom(501);
		expect(range(4).map(() => b())).not.toEqual(range(4).map(() => a()));
	});
});

describe('createSeed', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns an integer in the valid seed range', () => {
		for (const value of [0, 0.5, 0.999999999]) {
			vi.spyOn(Math, 'random').mockReturnValueOnce(value);
			const seed = createSeed();
			expect(Number.isInteger(seed)).toBe(true);
			expect(seed).toBeGreaterThanOrEqual(1);
			expect(seed).toBeLessThanOrEqual(2147483646);
		}
	});
});
