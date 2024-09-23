<script lang="ts">
	import { GameManager } from '$lib/managers/gameManager';
	import { cardsInGame } from '$lib/constants/cardsInGame';
	import { Language } from '$lib/languages/language';
	import { loadCards, languageData, setLanguage } from '$lib/languages/load';
	import { ApplicationState } from '$lib/constants/applicationState';

	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { t } from 'svelte-i18n';

	// The language the application is using.
	let currentLanguage = Language.FI;

	let gameManager: GameManager;

	onMount(async () => {
		gameManager = new GameManager();
		await getCards();
	});

	async function resetGame() {
		gameManager.resetGame();
		await loadCards(fetch);
	}

	async function startGame() {
		gameManager.startGame();
		await getCards();
	}

	function addPlayer(playerName: string) {
		gameManager.addPlayer(playerName);
	}

	function removePlayer(playerId: number) {
		gameManager.removePlayer(playerId);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			addPlayer(gameManager.gameState.playerName);
			gameManager.gameState.playerName = '';
		}
	}

	function showNextCard() {
		gameManager.showNextCard();
	}

	function getTarget(cardIndex: number, playerIndex: number): string {
		let card = gameManager.gameState.cards[cardIndex];

		if (!card.targetPlayer) {
			return '';
		}

		let randomIndex = playerIndex;
		while (randomIndex === playerIndex) {
			randomIndex = Math.floor(Math.random() * gameManager.gameState.players.length);
		}
		return gameManager.gameState.players[randomIndex].name;
	}

	async function getCards() {
		try {
			const data = get(languageData)[currentLanguage];
			if (data.cards) {
				gameManager.gameState.cards = data.cards;
			}
		} catch (error) {
			console.error('Error fetching data: ', error);
		}
	}

	async function changeLanguage(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newLanguage = select.value as Language;

		if (newLanguage !== currentLanguage) {
			await setLanguage(newLanguage);
			currentLanguage = newLanguage;
			await getCards();
		} else {
			console.warn('Language is already set to: ', currentLanguage);
		}
	}
</script>

<div class="game-container">
	{#if gameManager}
		<select class="language-selector" on:change={changeLanguage} title="Change Language">
			{#each Object.values(Language) as language}
				<option value={language}>{language}</option>
			{/each}
		</select>

		<button class="reset-button" on:click={resetGame} title="Reset Game">
			&#x21bb; <!-- Unicode for a circular reset icon -->
		</button>

		{#if gameManager.gameState.state === ApplicationState.LOBBY}
			<h1>{$t('title')}</h1>
			<button
				class="button"
				on:click={() => gameManager.changeGameState(ApplicationState.ADDING_PLAYERS)}
				>{$t('main-menu-start-button')}</button
			>
		{:else if gameManager.gameState.state === ApplicationState.ADDING_PLAYERS}
			<h2>{$t('add-player-names')}</h2>
			<input
				type="text"
				bind:value={gameManager.gameState.playerName}
				placeholder={$t('add-player-name')}
				on:keypress={handleKeyPress}
				class="input"
			/>
			{#if gameManager.gameState.players.length > 0}
				<ul class="player-list">
					{#each gameManager.gameState.players as player (player.id)}
						<li>
							<button class="remove-player" on:click={() => removePlayer(player.id)}
								>&#x2716;</button
							>
							{player.name}
						</li>
					{/each}
				</ul>
			{/if}
			<button
				class="button button-green"
				disabled={gameManager.gameState.players.length < 2}
				on:click={startGame}>{$t('game-start-button')}</button
			>
		{:else if gameManager.gameState.state === ApplicationState.PLAYING}
			<h1 class="target">
				{gameManager.gameState.players[gameManager.gameState.currentPlayerIndex].name}
			</h1>

			<article>
				<h2>{gameManager.gameState.cards[gameManager.gameState.currentCardIndex].title}</h2>
				<p>
					{gameManager.gameState.cards[gameManager.gameState.currentCardIndex].description}
				</p>
				{#if gameManager.gameState.cards[gameManager.gameState.currentCardIndex].targetPlayer}
					<b
						>{$t('target')}: {getTarget(
							gameManager.gameState.currentCardIndex,
							gameManager.gameState.currentPlayerIndex
						)}</b
					>
				{/if}
			</article>

			{#each gameManager.gameState.events as event}
				{#if event.ended === true}
					<h1 class="event-text">{event.person}, {$t('can-stop-the-mission')} {event.title}</h1>
				{/if}
			{/each}
			{#if gameManager.gameState.currentCardIndex + 1 < 29}
				<button class="button" on:click={showNextCard}>{$t('next-card')}</button>
			{:else if gameManager.gameState.currentCardIndex + 1 === 29}
				<button class="button" on:click={showNextCard}>{$t('last-card')}</button>
			{:else if gameManager.gameState.currentCardIndex + 1 === 30}
				<button class="button button-red" on:click={showNextCard}>{$t('game-over')}</button>
			{/if}
			<p class="game-status">{gameManager.gameState.currentCardIndex + 1}/{cardsInGame}</p>
		{:else if gameManager.gameState.state === ApplicationState.GAME_OVER}
			<h1>{$t('game-over')}</h1>
			<button
				class="button"
				on:click={() => {
					gameManager.changeGameState(ApplicationState.LOBBY);
					gameManager.gameState.events = [];
				}}>{$t('back-to-start')}</button
			>
		{/if}
	{/if}
</div>

<style>
	.game-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100vh;
	}

	.button-green {
		background-color: #2ecc71;
	}

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

	article {
		width: 50%;
		max-width: 600px;
	}

	.game-status {
		margin-top: 1rem;
	}

	.reset-button,
	.language-selector {
		position: absolute;
		top: 1rem;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		border-radius: 50%;
		font-size: 1.2rem;
		line-height: 1;
	}

	.reset-button {
		right: 1rem;
	}

	.language-selector {
		left: 1rem;
		appearance: none;
		background-image: none !important;
		-webkit-appearance: none;
		-moz-appearance: none;
	}
</style>
