<script lang="ts">
import { t } from 'svelte-i18n';
import type { GameState } from '$lib/interfaces/gameState';
import { gameStore } from '$lib/stores/gameStore';
import ReloadIcon from '$lib/components/icons/ReloadIcon.svelte';
import { onMount, tick } from 'svelte';
import { getTarget } from '$lib/managers/game';
import { getPersistentTarget, setPersistentTarget } from '$lib/utils/targetStorage';

let gameState: GameState;
gameStore.subscribe((value) => (gameState = value));
let targetPlayer: string;
let nameEl: HTMLElement;
let statusEl: HTMLElement;

$: beerLevel = (() => {
	const { currentCardIndex, cardAmount } = gameState;
	if (cardAmount == null || cardAmount <= 1) return 0;
	return ((cardAmount - 1 - currentCardIndex) / (cardAmount - 1)) * 100;
})();

let nameClips = { light: 'inset(0 0 100% 0)', dark: 'inset(0 0 0 0)' };
let statusClips = { light: 'inset(0 0 100% 0)', dark: 'inset(0 0 0 0)' };

function getClips(el: HTMLElement | undefined, surface: number) {
	if (!el || typeof window === 'undefined') {
		return { light: 'inset(0 0 100% 0)', dark: 'inset(0 0 0 0)' };
	}
	const rect = el.getBoundingClientRect();
	const rel = Math.max(0, Math.min(rect.height, surface - rect.top));
	return {
		light: `inset(0 0 ${rect.height - rel}px 0)`,
		dark: `inset(${rel}px 0 0 0)`,
	};
}

/** Splits the name and counter into light and dark halves at the beer surface. */
function updateClips() {
	if (typeof window === 'undefined') return;
	const surface = (1 - beerLevel / 100) * window.innerHeight;
	nameClips = getClips(nameEl, surface);
	statusClips = getClips(statusEl, surface);
}

$: beerLevel, tick().then(updateClips);

$: {
	const index = gameState.currentCardIndex;
	if (gameState.cards[index]?.targetPlayer) {
		const storedTarget = getPersistentTarget(index);
		if (storedTarget) {
			targetPlayer = storedTarget;
		} else {
			targetPlayer = getTarget(gameState);
			setPersistentTarget(index, targetPlayer);
		}
	}
}

onMount(() => {
	// Ensure the target is set after mount.
	const index = gameState.currentCardIndex;
	if (!targetPlayer && gameState.cards[index]?.targetPlayer) {
		targetPlayer = getPersistentTarget(index) || getTarget(gameState);
		setPersistentTarget(index, targetPlayer);
	}
	// Ensure shown card is a potentially rerolled new card.
	gameStore.updateCards();
	// The display font changes the name's height once it has loaded.
	document.fonts?.ready.then(updateClips);
});
</script>

<svelte:window on:resize={updateClips} />

<h1 class="target" bind:this={nameEl}>
	<span class="text-light" style:clip-path={nameClips.light}>{
		gameState.players[gameState.currentPlayerIndex].name
	}</span>
	<span class="text-dark" style:clip-path={nameClips.dark} aria-hidden="true">{
		gameState.players[gameState.currentPlayerIndex].name
	}</span>
</h1>

{#key gameState.cards[gameState.currentCardIndex].id}
	<article class="card">
		<button class="reroll" on:click={gameStore.reroll} title={$t('reroll')}>
			<ReloadIcon size="1.3rem" />
		</button>
		<h2>{gameState.cards[gameState.currentCardIndex].title}</h2>
		<p>
			{gameState.cards[gameState.currentCardIndex].description}
		</p>
		{#if gameState.cards[gameState.currentCardIndex].targetPlayer}
			<b class="target-line">{$t('target')}: <span class="target-name">{targetPlayer}</span></b>
		{/if}
	</article>
{/key}

{#if gameState.players[gameState.currentPlayerIndex].event}
	<article class="event-notice">
		<strong>{gameState.players[gameState.currentPlayerIndex].event?.person}</strong>,
		{$t('can-stop-the-mission')}
		<em>{gameState.players[gameState.currentPlayerIndex].event?.title}</em>
	</article>
{/if}

{#if gameState.currentCardIndex + 1 < (gameState.cardAmount ?? 0)}
	<button class="button button--large" on:click={gameStore.showNextCard}>{
		$t('next-card')
	}</button>
{:else}
	<button class="button button--large button--chili" on:click={gameStore.showNextCard}>
		{$t('game-over')}
	</button>
{/if}

<div class="progress-section">
	<p class="game-status" bind:this={statusEl}>
		<span class="text-light" style:clip-path={statusClips.light}>{
				gameState.currentCardIndex + 1
			}/{gameState.cardAmount}</span>
		<span class="text-dark" style:clip-path={statusClips.dark} aria-hidden="true">{
				gameState.currentCardIndex + 1
			}/{gameState.cardAmount}</span>
	</p>
	<progress value={gameState.currentCardIndex + 1} max={gameState.cardAmount}></progress>
</div>

<style>
.target {
	position: relative;
	max-width: 100%;
	font-size: clamp(2.75rem, 10vw, 4.25rem);
	line-height: 1;
	text-align: center;
	overflow-wrap: anywhere;
}

/* Padding keeps Shrikhand's swashes inside the clipped box. */
.text-light,
.text-dark {
	display: block;
	padding: 0.1em 0.18em 0.2em;
	transition: clip-path var(--pour-duration) var(--ease-pour);
}

.text-light {
	color: var(--foam);
}

.text-dark {
	position: absolute;
	inset: 0;
	color: var(--ink);
}

/* A beer coaster: pulpboard with a printed border and a visible edge. */
.card {
	position: relative;
	width: 600px;
	max-width: 100%;
	padding: 2rem 2.25rem 2.1rem;
	border-radius: 22px;
	background: var(--paper);
	color: var(--ink);
	box-shadow:
		0 1px 0 #f1e6cc,
		0 2px 0 #e8d8b6,
		0 3px 0 #dfcba2,
		0 4px 0 #d4bd90,
		0 24px 40px -14px rgba(60, 25, 0, 0.6);
	animation: deal 0.55s cubic-bezier(0.2, 0.9, 0.25, 1.1) both;
}

.card::before {
	content: '';
	position: absolute;
	inset: 9px;
	border: 1.5px solid var(--ink);
	border-radius: 14px;
	opacity: 0.8;
	pointer-events: none;
}

@keyframes deal {
	from {
		opacity: 0;
		transform: translateY(-22px) rotate(-3deg) scale(1.03);
	}
}

h2 {
	margin: 0 2.5rem 0.75rem 0;
	font-size: clamp(1.625rem, 5.5vw, 2.125rem);
}

.card p {
	font-size: 1.1875rem;
	line-height: 1.55;
}

.target-line {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5rem;
	margin-top: 1.25rem;
	font-size: 1rem;
	font-weight: 700;
}

.target-name {
	padding: 0.3rem 0.9rem 0.4rem;
	border-radius: 999px;
	background: var(--ink);
	color: var(--foam);
	font-family: var(--font-display);
	font-weight: 400;
	font-size: 1.125rem;
	line-height: 1.1;
}

.reroll {
	position: absolute;
	top: 1.1rem;
	right: 1.1rem;
	display: grid;
	place-items: center;
	width: 2.75rem;
	height: 2.75rem;
	padding: 0;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: var(--ink-soft);
	transition:
		background-color 0.15s,
		color 0.15s;
}

.reroll:hover {
	background: rgba(24, 33, 74, 0.08);
	color: var(--ink);
}

/* A slip tucked under the coaster for ongoing whole-round tasks. */
.event-notice {
	position: relative;
	width: 600px;
	max-width: 100%;
	padding: 0.9rem 1.25rem 0.95rem 3.25rem;
	border-radius: 14px;
	background: rgba(24, 33, 74, 0.9);
	color: var(--foam);
	font-size: 1rem;
	line-height: 1.45;
}

.event-notice::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 1.1rem;
	width: 1.25rem;
	height: 1.25rem;
	margin-top: -0.625rem;
	background: var(--beer-high);
	-webkit-mask: var(--hourglass) center / contain no-repeat;
	mask: var(--hourglass) center / contain no-repeat;
	--hourglass: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 2h12v2h-1v3.5a5 5 0 0 1-2.6 4.4L13.3 12l1.1.6A5 5 0 0 1 17 17v3h1v2H6v-2h1v-3a5 5 0 0 1 2.6-4.4l1.1-.6-1.1-.6A5 5 0 0 1 7 7.5V4H6zm3 2v3.5c0 1.1.6 2.1 1.6 2.6L12 11l1.4-.9c1-.5 1.6-1.5 1.6-2.6V4zm3 10-1.4.8A3 3 0 0 0 9 17v3h6v-3a3 3 0 0 0-1.6-2.6z'/%3E%3C/svg%3E");
}

.event-notice strong {
	font-weight: 800;
}

.event-notice em {
	font-style: normal;
	font-weight: 700;
	color: var(--beer-high);
}

.progress-section {
	width: min(300px, 90%);
	text-align: center;
}

.game-status {
	position: relative;
	margin: 0 0 0.35rem;
	font-family: var(--font-display);
	font-size: 1.5rem;
	line-height: 1;
}

@media (max-width: 480px) {
	.card {
		padding: 1.75rem 1.6rem 1.85rem;
	}

	.reroll {
		top: 0.75rem;
		right: 0.75rem;
	}
}
</style>
