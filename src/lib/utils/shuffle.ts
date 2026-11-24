/**
 * Shuffles an array in place using the Fisher–Yates algorithm.
 *
 * @param array - The array to shuffle.
 * @param random - Returns a number in [0, 1). Defaults to `Math.random`, can be replaced in tests.
 * @returns The same array, shuffled.
 */
export function shuffle<T>(array: T[], random: () => number = Math.random): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
