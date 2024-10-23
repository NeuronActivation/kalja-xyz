<script lang="ts">
	import { t } from 'svelte-i18n';
	import { gameStore } from '$lib/stores/gameStore';
	import type { GameState } from '$lib/interfaces/gameState';

	let gameState: GameState;
	gameStore.subscribe((value) => (gameState = value));

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && gameState.playerName) {
			gameStore.addPlayer(gameState.playerName);
			gameState.playerName = '';
		}
	}
</script>

<h2>{$t('add-player-names')}</h2>
<input
	type="text"
	bind:value={gameState.playerName}
	placeholder={$t('add-player-name')}
	on:keypress={handleKeyPress}
	class="input"
/>
{#if gameState.players.length > 0}
	<ul class="player-list">
		{#each gameState.players as player (player.id)}
			<li>
				<button class="remove-player" on:click={() => gameStore.removePlayer(player.id)}>
					&#x2716;
				</button>
				{player.name}
			</li>
		{/each}
	</ul>
{/if}
<button
	class="pico-background-jade-500"
	disabled={gameState.players.length < 2}
	on:click={() => gameStore.startGame()}
>
	{$t('game-start-button')}
</button>

<style>
	.player-list {
		padding-left: 0;
	}

	.player-list li {
		list-style-type: none;
	}

	.remove-player {
		all: unset;
		background-color: transparent;
		cursor: pointer;
		font-size: 14px;
		color: #666;
		transition: color 0.2s ease;
	}

	.remove-player:hover {
		color: #e74c3c;
	}

	input {
		width: 50%;
		max-width: 300px;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		outline: none;
	}

	input:focus {
		border-color: #2980b9;
	}
</style>
