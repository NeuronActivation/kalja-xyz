<script lang="ts">
import { gameStore } from '$lib/stores/gameStore';
import { ApplicationState } from '$lib/constants/applicationState';

$: ({ state, currentCardIndex, cardAmount } = $gameStore);

/** Beer level (0-100) after `index` cards have been drunk. */
function levelAt(index: number, amount: number) {
	return Math.max(0, ((amount - 1 - index) / (amount - 1)) * 100);
}

$: beerLevel = (() => {
	if (state === ApplicationState.ENDING) return 0;
	if (state !== ApplicationState.PLAYING || cardAmount == null || cardAmount === 0) {
		return 100;
	}
	return levelAt(currentCardIndex, cardAmount);
})();

/**
 * Foam lacing left on the glass at every level the beer has already passed.
 * Long games only keep every n-th ring so the glass doesn't turn solid white.
 */
const MAX_RINGS = 14;
$: rings = (() => {
	const playing = state === ApplicationState.PLAYING || state === ApplicationState.ENDING;
	if (!playing || cardAmount == null || cardAmount < 2) return [];
	const step = Math.ceil(cardAmount / MAX_RINGS);
	const drunk = Math.min(currentCardIndex, cardAmount);
	const result = [];
	// The first ring would sit on the rim, so start from the second.
	for (let i = step; i < drunk; i += step) {
		const rand = random(i * 7919 + 13);
		result.push({
			index: i,
			top: 100 - levelAt(i, cardAmount),
			pattern: i % LACE_PATTERNS,
			offset: Math.round(rand() * LACE_WIDTH),
			// Older rings have dried a little.
			opacity: 0.25 + 0.3 * (i / drunk),
		});
	}
	return result;
})();

/** Small deterministic PRNG so prerendered and hydrated markup match. */
function random(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function between(rand: () => number, min: number, max: number) {
	return rand() * (max - min) + min;
}

/** A periodic wave over `width`, so tiles repeat without seams. */
function wave(
	rand: () => number,
	width: number,
	amplitude: number,
	frequencies = [1, 2, 3, 5],
) {
	const parts = frequencies.map((frequency) => ({
		frequency,
		phase: rand() * Math.PI * 2,
		weight: rand() / frequency,
	}));
	const total = parts.reduce((sum, part) => sum + part.weight, 0);
	return (x: number) =>
		(amplitude / total) *
		parts.reduce(
			(sum, { frequency, phase, weight }) =>
				sum + weight * Math.sin((x / width) * Math.PI * 2 * frequency + phase),
			0,
		);
}

/** Copies a shape across the tile edge so a repeating tile has no visible seam. */
function wrapped(x: number, r: number, width: number, draw: (x: number) => string) {
	let out = draw(x);
	if (x - r < 0) out += draw(x + width);
	if (x + r > width) out += draw(x - width);
	return out;
}

/** Inlines an SVG as a CSS url(), escaping only what a data URI needs. */
const svg = (body: string, width: number, height: number) =>
	`url("data:image/svg+xml,${
		`<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${body}</svg>`
			.replace(/%/g, '%25')
			.replace(/#/g, '%23')
			.replace(/</g, '%3C')
			.replace(/>/g, '%3E')
	}")`;

const circle = (x: number, y: number, r: number) =>
	`<circle cx='${Math.round(x)}' cy='${Math.round(y)}' r='${r.toFixed(1)}'/>`;

/** One repeating tile of the foam head: a dense, creamy cap of tiny bubbles. */
function foamTile() {
	const rand = random(42);
	const W = 420;
	const H = 120;
	const top = wave(rand, W, 7);
	const bottom = wave(rand, W, 10);
	const topAt = (x: number) => 7 + top(x);
	const bottomAt = (x: number) => 88 + bottom(x);

	const steps = 60;
	let edge = '';
	for (let i = 0; i <= steps; i++) {
		const x = Math.round((i / steps) * W);
		edge += `${i === 0 ? 'M' : 'L'}${x} ${Math.round(topAt(x))}`;
	}
	for (let i = steps; i >= 0; i--) {
		const x = Math.round((i / steps) * W);
		edge += `L${x} ${Math.round(bottomAt(x))}`;
	}

	// Bubbles get bigger and more defined towards the beer.
	const bubbles = ['', '', '', ''];
	for (let i = 0; i < 230; i++) {
		const x = rand() * W;
		const depth = Math.pow(rand(), 0.8);
		const y = topAt(x) + 3 + depth * (bottomAt(x) - topAt(x) - 2);
		const r = between(rand, 0.7, 1.6) + depth * depth * between(rand, 1, 4.5);
		bubbles[Math.min(3, Math.floor(depth * 4))] += wrapped(x, r, W, (cx) => circle(cx, y, r));
	}

	// Loose bubbles drifting out of the foam into the beer.
	const cascade = ['', '', ''];
	for (let i = 0; i < 70; i++) {
		const x = rand() * W;
		const y = bottomAt(x) + Math.pow(rand(), 1.6) * 26;
		const r = between(rand, 0.6, 1.8);
		cascade[Math.floor(rand() * 3)] += wrapped(x, r, W, (cx) => circle(cx, y, r));
	}

	return svg(
		`<defs>` +
			`<linearGradient id='f' x1='0' y1='0' x2='0' y2='1'>` +
			`<stop offset='0' stop-color='#fffefa'/><stop offset='.45' stop-color='#fff6e3'/>` +
			`<stop offset='.8' stop-color='#f6e2b6'/><stop offset='1' stop-color='#ecc777'/>` +
			`</linearGradient>` +
			`<linearGradient id='s' x1='0' y1='0' x2='0' y2='1'>` +
			`<stop offset='0' stop-color='#fff' stop-opacity='.9'/><stop offset='.25' stop-color='#fff' stop-opacity='0'/>` +
			`<stop offset='.85' stop-color='#a86f1d' stop-opacity='0'/><stop offset='1' stop-color='#a86f1d' stop-opacity='.22'/>` +
			`</linearGradient>` +
			`</defs>` +
			`<path d='${edge}Z' fill='url(#f)'/>` +
			`<g fill='#fff' fill-opacity='.55' stroke='#b98b3c' stroke-width='.7'>` +
			bubbles.map((group, i) => `<g stroke-opacity='${0.22 + i * 0.08}'>${group}</g>`).join(
				'',
			) +
			`</g>` +
			`<path d='${edge}Z' fill='url(#s)'/>` +
			`<g fill='#fff8e6'>` +
			cascade.map((group, i) => `<g fill-opacity='${0.4 + i * 0.18}'>${group}</g>`).join('') +
			`</g>`,
		W,
		H,
	);
}

/**
 * Repeating tiles of foam lacing: a line of foam where the surface was, with a
 * net of burst bubbles draping down from it.
 */
const LACE_PATTERNS = 4;
const LACE_WIDTH = 900;
const LACE_HEIGHT = 72;
const LACE_LINE = 12;

function laceTile(seed: number) {
	const rand = random(seed);
	const clumps = wave(rand, LACE_WIDTH, 1, [1, 2, 3, 4, 7, 11]);
	const tilt = wave(rand, LACE_WIDTH, 3, [1, 2]);
	const scallop = rand() * Math.PI * 2;
	// How much foam stuck to the glass at x, from 0 (a gap) to 1.
	const strength = (x: number) => {
		const value = clumps(x);
		return value < -0.2 ? 0 : Math.min(1, (value + 0.2) / 0.9);
	};
	const drape = (x: number) =>
		strength(x) * 46 * (0.45 + 0.55 * Math.abs(Math.sin(x / 17 + scallop) * Math.sin(x / 43)));

	let line = '';
	for (let x = 0; x < LACE_WIDTH; x += 1.2) {
		const s = strength(x);
		if (s < 0.15) continue;
		const r = 0.5 + s * between(rand, 1.2, 2.2);
		const y = LACE_LINE + tilt(x) + between(rand, -0.8, 0.8);
		line += wrapped(
			x,
			r,
			LACE_WIDTH,
			(cx) => `<circle cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/>`,
		);
	}

	let net = '';
	for (let i = 0; i < 1400; i++) {
		const x = rand() * LACE_WIDTH;
		const depth = drape(x);
		if (depth < 3) continue;
		const t = Math.pow(rand(), 1.15);
		const y = LACE_LINE + tilt(x) + 1.5 + t * depth;
		const r = between(rand, 1.4, 3.8) * (1 - t * 0.5);
		const width = (between(rand, 0.55, 1) * (1 - t * 0.45)).toFixed(2);
		net += wrapped(
			x,
			r,
			LACE_WIDTH,
			(cx) =>
				`<circle cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}" r="${
					r.toFixed(1)
				}" stroke-width="${width}"/>`,
		);
	}

	for (let i = 0; i < 10; i++) {
		// Drips running down from the deepest drapes.
		const x = rand() * LACE_WIDTH;
		const depth = drape(x);
		if (depth < 8) continue;
		const top = LACE_LINE + tilt(x) + depth * 0.6;
		const length = between(rand, 6, 18);
		line += wrapped(
			x,
			2,
			LACE_WIDTH,
			(cx) =>
				`<path d="M${(cx - 1).toFixed(1)} ${top.toFixed(1)}Q${cx.toFixed(1)} ${
					(top + length * 1.2).toFixed(1)
				} ${(cx + 1).toFixed(1)} ${top.toFixed(1)}Z"/>` +
				`<circle cx="${cx.toFixed(1)}" cy="${(top + length * 0.6).toFixed(1)}" r="1.25"/>`,
		);
	}
	return { line, net };
}

const foam = foamTile();

/** Built on first use: the full glass on the start screens never shows any lacing. */
let lacePatterns: ReturnType<typeof laceTile>[] = [];
$: if (rings.length > 0 && lacePatterns.length === 0) {
	lacePatterns = Array.from({ length: LACE_PATTERNS }, (_, i) => laceTile(101 + i * 31));
}

/** Columns of bubbles rising from fixed points at the bottom of the glass. */
const streamRand = random(7);
const streams = Array.from({ length: 7 }, () => {
	// Two interleaved rows of bubbles make the spacing look irregular.
	const period = Math.round(between(streamRand, 13, 21));
	const offset = Math.round(period * between(streamRand, 1.4, 1.8));
	return {
		left: between(streamRand, 3, 97),
		period,
		offset,
		travel: period * offset,
		size: between(streamRand, 0.9, 1.5),
		duration: (period * offset) / between(streamRand, 70, 130),
		opacity: between(streamRand, 0.3, 0.6),
	};
});

/** Bigger bubbles rising on their own, with a little sway. */
const bubbleRand = random(1337);
const bubbles = Array.from({ length: 14 }, () => ({
	left: between(bubbleRand, 2, 96),
	size: between(bubbleRand, 3, 9),
	duration: between(bubbleRand, 6, 12),
	delay: -between(bubbleRand, 0, 12),
	sway: between(bubbleRand, 4, 14),
}));
</script>

<div class="glass" aria-hidden="true">
	{#if rings.length > 0}
		<svg class="lacing" xmlns="http://www.w3.org/2000/svg">
			<defs>
				{#each lacePatterns as { line, net }, i}
					<pattern
						id="lace-{i}"
						width={LACE_WIDTH}
						height={LACE_HEIGHT}
						patternUnits="userSpaceOnUse"
					>
						<g fill="#fff9ee">{@html line}</g>
						<g fill="none" stroke="#fff9ee">{@html net}</g>
					</pattern>
				{/each}
			</defs>
			{#each rings as ring (ring.index)}
				<svg y="{ring.top}%" overflow="visible">
					<g class="ring" style:opacity={ring.opacity} transform="translate({-ring.offset} {-LACE_LINE})">
						<rect width="6000" height={LACE_HEIGHT} fill="url(#lace-{ring.pattern})" />
					</g>
				</svg>
			{/each}
		</svg>
	{/if}

	<!-- A full glass overflows a little so no gap shows above the foam. -->
	<div class="beer" style:height={beerLevel >= 100 ? 'calc(100% + 24px)' : `${beerLevel}%`}>
		<div class="liquid">
			<div class="depth"></div>
			<div class="streams">
				{#each streams as stream}
					<div
						class="stream"
						style:left="{stream.left}%"
						style:--period="{stream.period}px"
						style:--offset="{stream.offset}px"
						style:--travel="{stream.travel}px"
						style:--size="{stream.size}px"
						style:opacity={stream.opacity}
						style:animation-duration="{stream.duration}s"
					>
					</div>
				{/each}
			</div>
			{#each bubbles as { left, size, duration, delay, sway }}
				<div
					class="bubble"
					style:left="{left}%"
					style:animation-duration="{duration}s"
					style:animation-delay="{delay}s"
				>
					<span
						style:width="{size}px"
						style:height="{size}px"
						style:--sway="{sway}px"
						style:animation-delay="{delay}s"
					></span>
				</div>
			{/each}
			<div class="surface-glow"></div>
		</div>
		<div class="head" style:background-image={foam}></div>
	</div>

	<div class="sheen"></div>
</div>

<style>
.glass {
	--head: clamp(64px, 11vh, 108px);
	position: fixed;
	inset: 0;
	z-index: -1;
	overflow: hidden;
	background:
		radial-gradient(120% 60% at 50% 0%, var(--dusk-glow) 0%, transparent 70%),
		var(--dusk);
}

/* Lacing sits behind the beer, so the liquid covers it until it drains past. */
.lacing {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	filter: blur(0.35px);
	/* Its own layer, so it isn't repainted while the beer drains past it. */
	will-change: transform;
}

.ring {
	animation: lace-in 1.6s ease-out both;
}

@keyframes lace-in {
	from {
		opacity: 0;
	}
}

/* Its top edge is the beer surface: Game.svelte clips text against this line. */
.beer {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	overflow: hidden;
	transition: height var(--pour-duration) var(--ease-pour);
}

/* The liquid starts under the foam so dusk shows between the foam's bumps. */
.liquid {
	position: absolute;
	top: calc(var(--head) * 0.55);
	bottom: 0;
	left: 0;
	right: 0;
	overflow: hidden;
}

/* Anchored to the glass rather than the surface: the bottom is always darker. */
.depth {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100vh;
	height: 100lvh;
	background:
		linear-gradient(
		90deg,
		rgba(110, 48, 0, 0.38) 0%,
		rgba(110, 48, 0, 0) 22%,
		rgba(255, 214, 120, 0.12) 50%,
		rgba(110, 48, 0, 0) 78%,
		rgba(110, 48, 0, 0.38) 100%
	),
		linear-gradient(
		to bottom,
		var(--beer-high) 0%,
		var(--beer) 32%,
		var(--beer-mid) 68%,
		var(--beer-deep) 100%
	);
}

/* Light falling through the head brightens the beer just under it. */
.surface-glow {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 30vh;
	background: linear-gradient(to bottom, rgba(255, 228, 150, 0.6), rgba(255, 228, 150, 0));
	pointer-events: none;
}

.streams {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100vh;
	height: 100lvh;
	-webkit-mask-image: linear-gradient(to top, transparent, #000 12%);
	mask-image: linear-gradient(to top, transparent, #000 12%);
}

.stream {
	--bubble: radial-gradient(
		circle at 50% 50%,
		rgba(255, 252, 235, 0.95) 0,
		rgba(255, 252, 235, 0.95) calc(var(--size) * 0.55),
		rgba(255, 240, 200, 0.35) var(--size),
		transparent calc(var(--size) + 0.8px)
	);
	position: absolute;
	bottom: calc(var(--travel) * -1);
	width: 8px;
	height: calc(100% + var(--travel));
	margin-left: -4px;
	background-image: var(--bubble), var(--bubble);
	background-size:
		8px var(--period),
		8px var(--offset);
	background-position:
		0 0,
		1px 5px;
	will-change: transform;
	animation: stream linear infinite;
}

@keyframes stream {
	to {
		transform: translateY(calc(var(--travel) * -1));
	}
}

.bubble {
	position: absolute;
	bottom: -12px;
	will-change: transform;
	animation: rise cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

.bubble span {
	display: block;
	border-radius: 50%;
	background: radial-gradient(
		circle at 35% 30%,
		rgba(255, 255, 255, 0.95) 0 16%,
		rgba(255, 246, 214, 0.28) 38%,
		rgba(255, 240, 200, 0.08) 64%
	);
	box-shadow: inset 0 0 0 1px rgba(255, 249, 226, 0.6);
	animation: sway 2.4s ease-in-out infinite alternate;
}

@keyframes rise {
	0% {
		transform: translateY(0);
		opacity: 0;
	}
	12% {
		opacity: 0.9;
	}
	100% {
		transform: translateY(-105vh);
		opacity: 0.9;
	}
}

@keyframes sway {
	from {
		transform: translateX(calc(var(--sway) * -0.5));
	}
	to {
		transform: translateX(calc(var(--sway) * 0.5));
	}
}

.head {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: calc(var(--head) * 1.25);
	background-repeat: repeat-x;
	background-size: auto 100%;
	filter: drop-shadow(0 2px 3px rgba(120, 66, 0, 0.25));
	will-change: transform;
}

/* Reflections on the curved glass, over both the beer and the empty glass. */
.sheen {
	position: absolute;
	inset: 0;
	pointer-events: none;
	background:
		linear-gradient(
		90deg,
		transparent 7%,
		rgba(255, 255, 255, 0.1) 9%,
		rgba(255, 255, 255, 0.22) 10.5%,
		rgba(255, 255, 255, 0.06) 12%,
		transparent 15%
	),
		linear-gradient(
		90deg,
		transparent 88%,
		rgba(255, 255, 255, 0.14) 89.5%,
		transparent 90.5%
	),
		linear-gradient(
		90deg,
		rgba(0, 0, 0, 0.18),
		transparent 6%,
		transparent 94%,
		rgba(0, 0, 0, 0.18)
	);
}

@media (prefers-reduced-motion: reduce) {
	.stream,
	.bubble,
	.bubble span,
	.ring {
		animation: none;
	}

	.beer {
		transition: none;
	}
}
</style>
