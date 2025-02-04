<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import { gameStore } from '$lib/stores/gameStore';
	import type { GameState } from '$lib/interfaces/gameState';
	import { Tag } from '$lib/constants/tag';

	let playerName: string;
	let gameState: GameState;
	gameStore.subscribe((value) => (gameState = value));

	onMount(async () => {
		await gameStore.initializeMaxCards();
	});

	/**
	 * Updates the state of a tag in the game state by setting it to 'include', 'exclude', or 'neutral'.
	 * Only one state can be active for a tag at a time.
	 *
	 * @param tag - The tag to update.
	 * @param state - The new state of the tag ('include', 'exclude', or 'neutral').
	 */
	async function setTagState(tag: Tag, state: 'include' | 'exclude' | 'neutral') {
		let newIncludedTags = [...gameState.includedTags];
		let newExcludedTags = [...gameState.excludedTags];

		// Reset any previous selection of the tag.
		newIncludedTags = newIncludedTags.filter((t) => t !== tag);
		newExcludedTags = newExcludedTags.filter((t) => t !== tag);

		// Apply the new state.
		if (state === 'include') {
			newIncludedTags.push(tag);
		} else if (state === 'exclude') {
			newExcludedTags.push(tag);
		}

		gameStore.updateTags(newIncludedTags, newExcludedTags);
		await gameStore.initializeMaxCards();
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
				min="1"
				max={gameState.maxCards}
				bind:value={gameState.cardAmount}
			/>
		</div>

		<!-- Tag Selection -->
		<div class="tag-selection">
			<h3>{$t('select-tags')}</h3>
			{#each Object.values(Tag) as tag}
				<div class="tag-toggle">
					<span>{$t(`tags.${tag}.name`)}</span>
					<div class="tag-buttons">
						<button
							class="include {gameState.includedTags.includes(tag) ? 'active' : ''}"
							on:click={() => setTagState(tag, 'include')}
						>
							✅
						</button>
						<button
							class="neutral {!gameState.excludedTags.includes(tag) &&
							!$gameStore.includedTags.includes(tag)
								? 'active'
								: ''}"
							on:click={() => setTagState(tag, 'neutral')}
						>
							➖
						</button>
						<button
							class="exclude {gameState.excludedTags.includes(tag) ? 'active' : ''}"
							on:click={() => setTagState(tag, 'exclude')}
						>
							❌
						</button>
					</div>
				</div>
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

	.tag-selection {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.tag-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 5px;
	}

	.tag-buttons {
		display: flex;
		gap: 5px;
	}

	.tag-buttons button:not(.active) {
		opacity: 0.3;
	}

	.include {
		background-color: #4caf50;
		color: white;
	}

	.exclude {
		background-color: #f44336;
		color: white;
	}

	.neutral {
		background-color: #9e9e9e;
		color: white;
	}
</style>
