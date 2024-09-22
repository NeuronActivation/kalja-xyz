import { type Card } from '$lib/models/card';

// Seeded random number generator using a linear congruential generator (LCG).
export function seededRandom(seed: number): () => number {
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

// Seeded shuffle function
export function seededShuffle(array: Card[], seed: number): Card[] {
	const random = seededRandom(seed);

	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
