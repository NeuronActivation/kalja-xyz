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

/** How far the card slider is filled, from 0 to 1. */
$: sliderFill = (() => {
	const max = gameState.maxCards ?? 1;
	if (max <= 1) return 1;
	return ((gameState.cardAmount ?? 1) - 1) / (max - 1);
})();
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
	class="field player-input"
/>
{#if gameState.players.length > 0}
	<ul class="player-list">
		{#each gameState.players as player (player.id)}
			<li>
				{player.name}
				<button class="remove-player" on:click={() => gameStore.removePlayer(player.id)}>
					×
				</button>
			</li>
		{/each}
	</ul>
{/if}
<details class="settings-panel">
	<summary>
		<span>{$t('settings')}</span>
		<svg class="chevron" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
			<path
				d="M6 9l6 6 6-6"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</summary>
	<div class="settings">
		<div class="tag-selection-container">
			<span class="settings-label">{$t('select-tags')}</span>
			<div class="tag-selection">
				{#each Object.values(Tag) as tag}
					<div class="tag-toggle" class:excluded={gameState.excludedTags.includes(tag)}>
						<span class="tag-name" title={$t(`tags.${tag}.tooltip`)}>
							{$t(`tags.${tag}.name`)}
						</span>
						<div class="tag-switch">
							<button
								class="tag-option include"
								class:active={gameState.includedTags.includes(tag)}
								on:click={() => setTagState(tag, 'include')}
								aria-label="Include tag"
							>
								<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
									<path
										d="M5 12.5l4.5 4.5L19 7.5"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
							<button
								class="tag-option exclude"
								class:active={gameState.excludedTags.includes(tag)}
								on:click={() => setTagState(tag, 'exclude')}
								aria-label="Exclude tag"
							>
								<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
									<path
										d="M7 7l10 10M17 7L7 17"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
									/>
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="slider-container">
			<label class="settings-label" for="cardAmount">{$t('settings-cards')}</label>
			<span class="card-count">{gameState.cardAmount}</span>
			<input
				type="range"
				id="cardAmount"
				name="cardAmount"
				min="1"
				max={gameState.maxCards}
				value={gameState.cardAmount}
				style:--fill="calc(0.875rem + (100% - 1.75rem) * {sliderFill})"
				on:input={(e) => gameStore.setCardAmount(Number(e.currentTarget.value))}
			/>
		</div>
	</div>
</details>
<button
	class="button button--large start-button"
	disabled={gameState.players.length < 2 || (gameState.cardAmount ?? 0) < 1}
	on:click={() => gameStore.startGame()}
>
	{$t('game-start-button')}
</button>

<style>
h2 {
	text-align: center;
}

.player-input {
	width: min(100%, 340px);
}

.player-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.5rem;
	max-width: 600px;
	margin: 0;
	padding: 0;
	list-style: none;
}

.player-list li {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.3rem 0.35rem 0.35rem 0.95rem;
	border-radius: 999px;
	background: var(--ink);
	color: var(--foam);
	font-weight: 700;
	box-shadow: 0 3px 0 var(--ink-edge);
	animation: pop-in 0.3s var(--ease-out) both;
}

@keyframes pop-in {
	from {
		opacity: 0;
		transform: scale(0.7);
	}
}

.remove-player {
	display: grid;
	place-items: center;
	width: 1.75rem;
	height: 1.75rem;
	padding: 0 0 0.1rem;
	border: 0;
	border-radius: 50%;
	background: rgba(255, 249, 238, 0.14);
	color: inherit;
	font-size: 1.25rem;
	line-height: 1;
	transition: background-color 0.15s;
}

.remove-player:hover {
	background: rgba(255, 249, 238, 0.3);
}

/* Settings fold out of a paper panel, like the cards in the game. */
.settings-panel {
	width: min(100%, 540px);
	border-radius: 18px;
	background: var(--paper);
	box-shadow:
		0 3px 0 var(--paper-edge),
		0 18px 32px -16px rgba(60, 25, 0, 0.55);
}

summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 3.25rem;
	padding: 0.5rem 1rem 0.5rem 1.25rem;
	border-radius: 18px;
	font-weight: 700;
	cursor: pointer;
	list-style: none;
	user-select: none;
}

summary::-webkit-details-marker {
	display: none;
}

.chevron {
	transition: transform 0.2s var(--ease-out);
}

details[open] .chevron {
	transform: rotate(180deg);
}

details[open] summary {
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}

.settings {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	padding: 0.25rem 1.25rem 1.5rem;
}

.settings-label {
	display: block;
	font-size: 0.875rem;
	font-weight: 700;
	color: var(--ink-soft);
}

.tag-selection {
	display: grid;
	grid-template-columns: 1fr;
	column-gap: 1.5rem;
	margin-top: 0.25rem;
}

@media (min-width: 480px) {
	.tag-selection {
		grid-template-columns: repeat(2, 1fr);
	}
}

.tag-toggle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	padding: 0.4rem 0;
	border-bottom: 1px solid rgba(24, 33, 74, 0.1);
}

.tag-name {
	transition: opacity 0.15s;
}

.tag-toggle.excluded .tag-name {
	opacity: 0.5;
	text-decoration: line-through;
	text-decoration-thickness: 0.08em;
}

.tag-switch {
	display: flex;
	flex-shrink: 0;
	gap: 2px;
	padding: 2px;
	border-radius: 999px;
	box-shadow: inset 0 0 0 1.5px rgba(24, 33, 74, 0.25);
}

.tag-option {
	display: grid;
	place-items: center;
	width: 2.5rem;
	height: 2rem;
	padding: 0;
	border: 0;
	border-radius: 999px;
	background: transparent;
	color: rgba(24, 33, 74, 0.4);
	transition:
		background-color 0.15s,
		color 0.15s;
}

.tag-option:hover:not(.active) {
	color: var(--ink);
}

.tag-option.include.active {
	background: var(--hop);
	color: var(--foam);
}

.tag-option.exclude.active {
	background: var(--chili);
	color: var(--foam);
}

.slider-container {
	display: grid;
	grid-template-columns: 1fr auto;
	align-items: baseline;
	row-gap: 0.25rem;
}

.card-count {
	font-family: var(--font-display);
	font-size: 1.75rem;
	line-height: 1;
}

.slider-container input {
	grid-column: 1 / -1;
}
</style>
