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
	 * Updates the state of a tag in the game state by setting it to 'include' or 'exclude'.
	 * Only one state can be active for a tag at a time.
	 *
	 * @param tag - The tag to update.
	 * @param state - The new state of the tag ('include' or 'exclude').
	 */
	async function setTagState(tag: Tag, state: 'include' | 'exclude') {
		let newIncludedTags = [...gameState.includedTags];
		let newExcludedTags = [...gameState.excludedTags];

		if (state === 'include') {
			if (newIncludedTags.includes(tag)) {
				// If already included, reset to neutral.
				newIncludedTags = newIncludedTags.filter((t) => t !== tag);
			} else {
				// Set as included and ensure it's not excluded.
				newExcludedTags = newExcludedTags.filter((t) => t !== tag);
				newIncludedTags.push(tag);
			}
		} else if (state === 'exclude') {
			if (newExcludedTags.includes(tag)) {
				// If already excluded, reset to neutral.
				newExcludedTags = newExcludedTags.filter((t) => t !== tag);
			} else {
				// Set as excluded and ensure it's not included.
				newIncludedTags = newIncludedTags.filter((t) => t !== tag);
				newExcludedTags.push(tag);
			}
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
		<div class="tag-selection-container">
			<span><b>{$t('select-tags')}:</b></span>
			<div class="grid tag-selection">
				{#each Object.values(Tag) as tag}
					<div class="tag-toggle flex justify-between align-center">
						<span class="text-sm" title={$t(`tags.${tag}.tooltip`)}>
							{$t(`tags.${tag}.name`)}
						</span>
						<div class="flex gap-0">
							<button
								class="tag-option include"
								class:active={gameState.includedTags.includes(tag)}
								on:click={() => setTagState(tag, 'include')}
								aria-label="Include tag"
							>
								✓
							</button>
							<button
								class="tag-option exclude small"
								class:active={gameState.excludedTags.includes(tag)}
								on:click={() => setTagState(tag, 'exclude')}
								aria-label="Exclude tag"
							>
								⨯
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<span><b>{$t('settings-cards')}</b>:</span>
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
	</div>
</details>
<button
	class="start-button pico-background-jade-500"
	disabled={gameState.players.length < 2 || (gameState.cardAmount ?? 0) < 1}
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
		display: flex;
		flex-direction: column;
		align-items: center;
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

	.tag-selection-container {
		width: 100%;
		padding: 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.tag-selection {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		margin: 0 30px;
		gap: 10px;
		margin: 10px;
		width: 100%;
	}

	.tag-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.tag-option {
		cursor: pointer;
		padding: 0;
		width: 25px;
		height: 25px;
		font-size: 0.8rem;
		color: white;
		border-radius: 50%;
		line-height: 1;
	}

	.tag-option:not(.active) {
		opacity: 0.3;
	}

	.tag-option.include {
		background-color: #4caf50;
	}

	.tag-option.exclude {
		background-color: #f44336;
	}
</style>
