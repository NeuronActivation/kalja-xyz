<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import { gameStore } from '$lib/stores/gameStore';
	import type { GameState } from '$lib/interfaces/gameState';
	import { Tag } from '$lib/constants/tag';

	// Proof of concept: Setting the card required by index.
	let inputValue: number | null = null;
	function handleInput(event: KeyboardEvent) {
		if (event.key === "Enter" && inputValue !== null) {
			const target = event.target as HTMLInputElement;
			const value = Number(target.value);
			inputValue = isNaN(value) ? null : value;
			if (inputValue || inputValue == 0)
			{
				const cards = gameStore.getCards();
				if (cards)
				{
					const card = cards.find((card) => card.id === inputValue);
					if (card)
					{
						console.log("Chosen card: ", card.title);
						const isCurrentlyRequired = card.required;
						gameStore.setRequired(card.id, !isCurrentlyRequired);

						const newCards = gameStore.getCards();
						const updatedCard = newCards?.find((card) => card.id === inputValue);
						console.log("Updated card: ", updatedCard);
					}
				}
			}
		}
	}

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
			<li class="pico-background-zinc-600">
				{player.name}
				<button class="remove-player" on:click={() => gameStore.removePlayer(player.id)}>
					×
				</button>
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
			<span class="card-count">{gameState.cardAmount}</span>
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

<input
  type="number"
  bind:value={inputValue}
  on:keydown={handleInput}
  placeholder="Enter a number and press Enter"
/>

<style>
	.player-list {
		padding-left: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		justify-content: center;
		max-width: 600px;
		margin: 1rem auto;
	}

	.player-list li {
		list-style-type: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		border-radius: 1rem;
		padding: 0.4rem 0.6rem;
	}

	.remove-player {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		font-size: 1.2rem;
		line-height: 1;
		opacity: 0.8;
		transition: opacity 0.2s ease;
		padding: 0;
		margin: 0;
		margin-left: 0.25rem;
		vertical-align: middle;
		transform: translateY(-1px); /* Fine-tune on y-axis */
	}

	.remove-player:hover {
		opacity: 1;
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

	.card-count {
		min-width: 3ch;
		text-align: center;
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
