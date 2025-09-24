<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { GameState } from '$lib/interfaces/gameState';
	import { gameStore } from '$lib/stores/gameStore';
	import ReloadIcon from '$lib/components/icons/ReloadIcon.svelte';
	import { onMount } from 'svelte';
	import { getTarget } from '$lib/managers/game';
	import { getPersistentTarget, setPersistentTarget } from '$lib/utils/targetStorage';

	let gameState: GameState;
	gameStore.subscribe((value) => (gameState = value));
	let targetPlayer: string;

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

<h1 class="target">
	{gameState.players[gameState.currentPlayerIndex].name}
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
		<b>{$t('target')}: <span class="target-name pico-background-zinc-600">{
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
	<p class="game-status">{gameState.currentCardIndex + 1}/{gameState.cardAmount}</p>
	<progress value={gameState.currentCardIndex + 1} max={gameState.cardAmount}></progress>
</div>

<style>
	article {
		width: 600px;
		position: relative;
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--card-background-color);
		padding: 0 0.5rem;
		font-size: 1.2rem;
	}

	.progress-section {
		text-align: center;
		max-width: 300px;
	}

	.game-status {
		margin: 1rem 0 0.5rem 0;
		font-size: 0.9rem;
		color: var(--muted-color);
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
		color: #666;
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
