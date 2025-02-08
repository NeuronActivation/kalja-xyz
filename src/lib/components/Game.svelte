<script lang="ts">
	import { t } from 'svelte-i18n';
	import { game } from '$lib/managers/game';
	import type { GameState } from '$lib/interfaces/gameState';
	import { gameStore } from '$lib/stores/gameStore';
	import ReloadIcon from '$lib/components/icons/ReloadIcon.svelte';
	import { onMount } from 'svelte';
	import { getPersistentTarget, setPersistentTarget } from '$lib/utils/storage';

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
				targetPlayer = game.getTarget(gameState);
				setPersistentTarget(index, targetPlayer);
			}
		}
	}

	onMount(() => {
		// Ensure the target is set after mount.
		const index = gameState.currentCardIndex;
		if (!targetPlayer && gameState.cards[index]?.targetPlayer) {
			targetPlayer = getPersistentTarget(index) || game.getTarget(gameState);
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
		<b>{$t('target')}: {targetPlayer}</b>
	{/if}
</article>

{#each gameState.events as event}
	{#if event.ended === true}
		<h2 class="event-text">{event.person}, {$t('can-stop-the-mission')} {event.title}</h2>
	{/if}
{/each}

{#if gameState.currentCardIndex + 1 < (gameState.cardAmount ?? 0)}
	<button on:click={gameStore.showNextCard}>{$t('next-card')}</button>
{:else}
	<button class="pico-background-red-500" on:click={gameStore.showNextCard}>
		{$t('game-over')}
	</button>
{/if}

<p class="game-status">{gameState.currentCardIndex + 1}/{gameState.cardAmount}</p>

<style>
	article {
		position: relative;
		width: 600px;
	}

	.game-status {
		margin-top: 1rem;
		text-align: center;
	}

	.event-text {
		text-align: center;
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
		article {
			max-width: 90%;
		}
	}
</style>
