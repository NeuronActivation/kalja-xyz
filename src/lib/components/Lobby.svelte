<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import { gameStore } from '$lib/stores/gameStore';
	import type { GameState } from '$lib/interfaces/gameState';
	import { Tag } from '$lib/constants/tag';

	let playerName: string;
	let gameState: GameState;
	gameStore.subscribe((value) => (gameState = value));

	onMount(() => {
		gameStore.initializeMaxCards();
	});

	function toggleTag(tag: Tag) {
		const updatedTags = gameState.selectedTags.includes(tag)
			? gameState.selectedTags.filter((t) => t !== tag)
			: [...gameState.selectedTags, tag];

		gameStore.updateSelectedTags(updatedTags);
	}
</script>

<h2>{$t('add-player-names')}</h2>
<input
	type="text"
	bind:value={playerName}
	placeholder={$t('add-player-name')}
	on:keydown={(e) => {
		if (e.key === 'Enter' && playerName) {
			gameStore.addPlayer(playerName);
			playerName = '';
		}
	}}
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
<details>
	<summary>
		<span>{$t('settings')}</span>
	</summary>
	<div class="settings">
		<span>{$t('settings-cards')}:</span>
		<div class="slider-container">
			<span>{gameState.cardAmount}</span>
			<input
				type="range"
				id="cardAmount"
				name="cardAmount"
				min="10"
				max={gameState.maxCards ?? 10}
				bind:value={gameState.cardAmount}
			/>
		</div>

		<!-- Tag Selection Checkboxes -->
		<div class="tag-selection">
			<h3>{$t('select-tags')}</h3>
			{#each Object.values(Tag) as tag}
				<label>
					<input
						type="checkbox"
						checked={gameState.selectedTags.includes(tag)}
						on:change={() => toggleTag(tag)}
					/>
					{$t(`tag-${tag}`)}
				</label>
			{/each}
		</div>
	</div>
</details>
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

	summary {
		font-size: 0.9rem;
		color: #666;
	}

	.settings {
		font-size: 0.9rem;
	}

	.slider-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	input[type='range'] {
		padding: 0;
		margin: 0;
		flex: 1;
	}
</style>
