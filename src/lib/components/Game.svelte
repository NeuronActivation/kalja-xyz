<script lang="ts">
	import { t } from 'svelte-i18n';
	import { game } from '$lib/managers/game';
	import type { GameState } from '$lib/interfaces/gameState';
	import { gameStore } from '$lib/stores/gameStore';
	import ReloadIcon from '$lib/components/icons/ReloadIcon.svelte';

	let gameState: GameState;
	gameStore.subscribe((value) => (gameState = value));
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
		<b>{$t('target')}: {game.getTarget(gameState)}</b>
	{/if}
</article>

{#each gameState.events as event}
	{#if event.ended === true}
		<h1 class="event-text">{event.person}, {$t('can-stop-the-mission')} {event.title}</h1>
	{/if}
{/each}

{#if gameState.currentCardIndex + 1 < gameState.cardAmount}
	<button on:click={gameStore.showNextCard}>{$t('next-card')}</button>
{:else}
	<button class="pico-background-red-500" on:click={gameStore.showNextCard}>
		{$t('game-over')}
	</button>
{/if}

<p class="game-status">{gameState.currentCardIndex + 1}/{gameState.cardAmount}</p>

<style>
	article {
		width: 50%;
		max-width: 600px;
		position: relative;
	}
	.game-status {
		margin-top: 1rem;
	}
	.reroll {
		all: unset;
		cursor: pointer;
		position: absolute;
		margin: 10px;
		line-height: 0;
		color: #666;
		top: 0;
		right: 0;
	}
</style>
