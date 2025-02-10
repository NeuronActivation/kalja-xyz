import { type Card } from '$lib/interfaces/card';

/**
 * Shuffles an array of cards in place using a seeded random number generator.
 * This function ensures a deterministic shuffle based on the provided seed, which allows
 * reproducibility of the shuffle order.
 *
 * @param array - The array of `Card` objects to shuffle.
 * @param seed - The seed value to initialize the random number generator.
 *               This ensures the shuffle order is consistent across calls with the same seed.
 * @returns A new shuffled array of `Card` objects.
 */
export function seededShuffle(array: Card[], seed: number): Card[] {
	const random = seededRandom(seed);

	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

/**
 * Creates a seeded random number generator using a linear congruential generator (LCG).
 * The generator produces pseudorandom numbers based on the given seed.
 *
 * @param seed - The seed value to initialize the random number generator.
 *               It should be a positive integer less than 2147483647.
 * @returns A function that generates a pseudorandom number between 0 and 1.
 *          Each call to the returned function produces a new pseudorandom number.
 */
function seededRandom(seed: number): () => number {
	// Ensure the seed is a positive number between 1 and 2147483646.
	let s = seed % 2147483647;

	// Adjust seed if non-positive.
	if (s <= 0) s += 2147483646;

	// Return a function that generates pseudorandom numbers.
	return () => {
		// Advance the internal state using the LCG formula: s = (s * 16807) % 2147483647.
		s = (s * 16807) % 2147483647;

		// Normalize the result to a floating-point number in the range [0, 1].
		return (s - 1) / 2147483646;
	};
}
