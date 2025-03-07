<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { GameState } from '$lib/interfaces/gameState';
	import { gameStore } from '$lib/stores/gameStore';
	import ReloadIcon from '$lib/components/icons/ReloadIcon.svelte';
	import { onMount } from 'svelte';
	import { getTarget } from '$lib/managers/game';
	import { setPersistentTarget, getPersistentTarget } from '$lib/utils/targetStorage';

	// Timer logic.
	const initialTime: number = 10;
	let time: number = initialTime;
	let isRunning: boolean = false;
	let isTimerVisible: boolean = false;
	let intervalId: number;

	function startTimer() {
		if (!isRunning) {
			isRunning = true;
			intervalId = setInterval(() => {
				if (time > 0) {
					time -= 1;
				} else {
					clearInterval(intervalId);
					isRunning = false;
				}
			}, 1000);
		}
	}

	function resetTimer() {
		clearInterval(intervalId);
		isRunning = false;
		time = initialTime;
	};

	function toggleTimerVisibility() {
		isTimerVisible = !isTimerVisible;
	};


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

<!-- Timer UI -->
<div class="timer-container">
	<button class="timer-button" on:click={toggleTimerVisibility}>
		{isTimerVisible ? 'Hide Timer' : 'Show Timer'}
	</button>
</div>

{#if isTimerVisible}
	<div class="timer-popup">
		<h1>{time}</h1>
		<input type="range" min="1" max="120" bind:value={time} disabled={isRunning} />
		<button on:click={startTimer} disabled={isRunning}>Start Timer</button>
		<button on:click={resetTimer}>Reset Timer</button>
	</div>
{/if}

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

	.timer-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
	}

	.timer-popup {
		position: fixed;
		top: 20%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 20px;
		border: 1px solid #ccc;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		text-align: center;
	}

	.timer-button {
		padding: 10px 20px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s ease;
	}

	.timer-button:hover {
		background: #0056b3;
	}
</style>
