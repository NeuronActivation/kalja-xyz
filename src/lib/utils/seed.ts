import { shuffle } from '#lib/utils/shuffle.ts';

const MODULUS = 2147483647;

/**
 * Creates a random seed that can be passed to `seededShuffle`.
 *
 * @returns An integer between 1 and 2147483646.
 */
export function createSeed(): number {
	return Math.floor(Math.random() * (MODULUS - 1)) + 1;
}

/**
 * Shuffles an array in place, so that the same seed always produces the same order.
 *
 * @param array - The array to shuffle.
 * @param seed - An integer seed, for example from `createSeed`.
 * @returns The same array, shuffled.
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
	return shuffle(array, seededRandom(seed));
}

/**
 * Creates a seeded random number generator using the Park–Miller linear congruential generator.
 *
 * @param seed - The seed value. Fractions are dropped, and values outside 1–2147483646 are wrapped
 *               into that range.
 * @returns A function that returns a pseudorandom number in [0, 1) on each call.
 */
export function seededRandom(seed: number): () => number {
	// A fractional seed (such as one from Math.random()) can make the state smaller than 1,
	// which produces negative numbers and broke the shuffle.
	let s = Math.floor(seed) % MODULUS;
	if (s <= 0) s += MODULUS - 1;

	return () => {
		s = (s * 16807) % MODULUS;
		return (s - 1) / (MODULUS - 1);
	};
}
