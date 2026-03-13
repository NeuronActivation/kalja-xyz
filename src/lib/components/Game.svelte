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

	$: beerLevel,
		tick().then(() => {
			if (typeof window === 'undefined') return;
			const surface = (1 - beerLevel / 100) * window.innerHeight;
			nameClips = getClips(nameEl, surface);
			statusClips = getClips(statusEl, surface);
		});

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
	});
</script>

<h1 class="target" bind:this={nameEl}>
	<span class="text-light" style:clip-path={nameClips.light}>{
		gameState.players[gameState.currentPlayerIndex].name
	}</span>
	<span class="text-dark" style:clip-path={nameClips.dark}>{
		gameState.players[gameState.currentPlayerIndex].name
	}</span>
</h1>

<article>
	<button class="reroll" on:click={gameStore.reroll} title={$t('reroll')}>
		<ReloadIcon size="1.1rem" />
	</button>
	<h2>{gameState.cards[gameState.currentCardIndex].title}</h2>
	<p>
		{gameState.cards[gameState.currentCardIndex].description}
	</p>
	{#if gameState.cards[gameState.currentCardIndex].targetPlayer}
		<b>{$t('target')}: <span class="target-name pico-background-amber-700">{
				targetPlayer
			}</span></b>
	{/if}
</article>

{#if gameState.players[gameState.currentPlayerIndex].event}
	<article class="event-notice">
		<strong>{gameState.players[gameState.currentPlayerIndex].event?.person}</strong>,
		{$t('can-stop-the-mission')}
		<em>{gameState.players[gameState.currentPlayerIndex].event?.title}</em>
	</article>
{/if}

{#if gameState.currentCardIndex + 1 < (gameState.cardAmount ?? 0)}
	<button on:click={gameStore.showNextCard}>{$t('next-card')}</button>
{:else}
	<button class="pico-background-red-500" on:click={gameStore.showNextCard}>
		{$t('game-over')}
	</button>
{/if}

<div class="progress-section">
	<p class="game-status" bind:this={statusEl}>
		<span class="text-light" style:clip-path={statusClips.light}>{
				gameState.currentCardIndex + 1
			}/{gameState.cardAmount}</span>
		<span class="text-dark" style:clip-path={statusClips.dark}>{
				gameState.currentCardIndex + 1
			}/{gameState.cardAmount}</span>
	</p>
	<progress value={gameState.currentCardIndex + 1} max={gameState.cardAmount}></progress>
</div>

<style>
	.target {
		position: relative;
	}

	.text-light {
		display: block;
		color: white;
		transition: clip-path 4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.text-dark {
		display: block;
		position: absolute;
		inset: 0;
		color: black;
		transition: clip-path 4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	article {
		width: 600px;
		position: relative;
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	h2 {
		color: var(--pico-color);
	}

	.target-name {
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.9rem;
		color: white;
	}

	.event-notice {
		text-align: center;
		padding: 1.5rem;
		border-radius: 1rem;
		font-size: 1rem;
		max-width: 600px;
		position: relative;
	}

	.event-notice::before {
		content: '⏳';
		position: absolute;
		top: -1.4rem;
		left: 50%;
		transform: translateX(-50%);
		font-size: 1.2rem;
	}

	.progress-section {
		text-align: center;
		max-width: 300px;
	}

	.game-status {
		position: relative;
		margin: 1rem 0 0.5rem 0;
		font-size: 0.9rem;
	}

	progress {
		width: 100%;
		height: 0.5rem;
	}

	.reroll {
		all: unset;
		cursor: pointer;
		position: absolute;
		margin: 10px;
		padding: 8px;
		line-height: 0;
		color: var(--pico-muted-color);
		top: 0;
		right: 0;
	}

	@media (max-width: 768px) {
		article, .event-notice {
			max-width: 90%;
		}

		.progress-section {
			max-width: 90%;
		}
	}
</style>
