<script lang="ts">
	import { get } from 'svelte/store';
	import { cardsInGame } from '$lib/constants/cardsInGame';
	import { Language } from '$lib/languages/language';
	import { loadCards, languageData, setLanguage } from '$lib/languages/load';
	import type { Card } from '$lib/models/card';
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';

	let gameCards: Card[] = [];

	// Input field value.
	let playerName = '';

	// Which card is currently in play.
	let currentCardIndex = 0;

	// Which player the question is targeting.
	let currentPlayerIndex = 0;

	// The language the application is using.
	let currentLanguage = Language.FI;

	enum GameStates {
		LOBBY = 'lobby',
		ADDING_PLAYERS = 'adding_players',
		PLAYING = 'playing',
		GAME_OVER = 'game_over'
	}

	type GameEvent = {
		title: string;
		person: string;
		startingIndex: number;
		ended: boolean;
	};
	let events: GameEvent[] = [];

	type Player = {
		id: number;
		name: string;
	};

	type GameContext = {
		state: GameStates;
		players: Player[];
	};

	let gameContext: GameContext = {
		state: GameStates.LOBBY,
		players: []
	};

	function saveGameState() {
		const state = {
			gameCards,
			playerName,
			currentCardIndex,
			currentPlayerIndex,
			gameContext,
			events
		};
		sessionStorage.setItem('gameState', JSON.stringify(state));
	}

	onMount(async () => {
		await getCards();

		const savedState = sessionStorage.getItem('gameState');
		if (savedState) {
			const parsedState = JSON.parse(savedState);

			// Restore the state
			gameCards = parsedState.gameCards || [];
			playerName = parsedState.playerName || '';
			currentCardIndex = parsedState.currentCardIndex || 0;
			currentPlayerIndex = parsedState.currentPlayerIndex || 0;
			gameContext = parsedState.gameContext || { state: GameStates.LOBBY, players: [] };
			events = parsedState.events || [];
		}
	});

	async function resetGame() {
		await loadCards(fetch);
		gameContext = { state: GameStates.LOBBY, players: [] };
		gameCards = [];
		events = [];
		sessionStorage.removeItem('gameState');
	}

	function changeGameState(newState: GameStates) {
		gameContext.state = newState;
		saveGameState();
	}

	async function startGame() {
		gameContext.players.sort(() => Math.random() - 0.5);
		await getCards();
		currentCardIndex = 0;
		currentPlayerIndex = 0;
		changeGameState(GameStates.PLAYING);
		saveGameState();
	}

	function addPlayer(playerName: string) {
		const newPlayer: Player = { id: gameContext.players.length + 1, name: playerName };
		gameContext.players = [...gameContext.players, newPlayer];
		saveGameState();
	}

	function removePlayer(playerId: number) {
		gameContext.players = gameContext.players.filter((player) => player.id !== playerId);
		saveGameState();
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			addPlayer(playerName);
			playerName = '';
		}
	}

	function showNextCard() {
		currentCardIndex += 1;
		currentPlayerIndex += 1;

		// Go to game over if out of cards.
		// Card index doesn't have to be updated since it's always updated in startGame().
		if (currentCardIndex >= cardsInGame) {
			changeGameState(GameStates.GAME_OVER);
			return;
		}

		if (currentPlayerIndex >= gameContext.players.length) {
			currentPlayerIndex = 0;
		}

		// Clearing ended events.
		events = events.filter((item) => !item.ended);

		// Last card so all events automatically end.
		if (currentCardIndex + 1 >= cardsInGame) {
			events.forEach((event) => {
				event.ended = true;
			});
			return;
		}

		// Event ends normally.
		events.forEach((event) => {
			if (currentPlayerIndex === event.startingIndex) {
				event.ended = true;
			}
		});

		// Add a new event.
		if (gameCards[currentCardIndex].timedEvent) {
			let event: GameEvent = {
				title: gameCards[currentCardIndex].title,
				person: gameContext.players[currentPlayerIndex].name,
				startingIndex: currentPlayerIndex,
				ended: false
			};
			events.push(event);
		}
		saveGameState();
	}

	function getTarget(cardIndex: number, playerIndex: number): string {
		let card = gameCards[cardIndex];

		if (!card.targetPlayer) {
			return '';
		}

		let randomIndex = playerIndex;
		while (randomIndex === playerIndex) {
			randomIndex = Math.floor(Math.random() * gameContext.players.length);
		}
		return gameContext.players[randomIndex].name;
	}

	async function getCards() {
		try {
			const data = get(languageData)[currentLanguage];
			if (data.cards) {
				gameCards = data.cards;
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

<select class="language-selector" on:change={changeLanguage}>
	{#each Object.values(Language) as language}
		<option value={language}>{language}</option>
	{/each}
</select>

<div class="game-container">
	<button class="reset-button" on:click={resetGame} title="Reset Game">
		&#x21bb; <!-- Unicode for a circular reset icon -->
	</button>

	{#if gameContext.state === GameStates.LOBBY}
		<h1>{$t('title')}</h1>
		<button class="button" on:click={() => changeGameState(GameStates.ADDING_PLAYERS)}
			>{$t('main-menu-start-button')}</button
		>
	{:else if gameContext.state === GameStates.ADDING_PLAYERS}
		<h2>{$t('add-player-names')}</h2>
		<input
			type="text"
			bind:value={playerName}
			placeholder={$t('add-player-name')}
			on:keypress={handleKeyPress}
			class="input"
		/>
		{#if gameContext.players.length > 0}
			<ul class="player-list">
				{#each gameContext.players as player (player.id)}
					<li>
						<button class="remove-player" on:click={() => removePlayer(player.id)}>&#x2716;</button>
						{player.name}
					</li>
				{/each}
			</ul>
		{/if}
		<button
			class="button button-green"
			disabled={gameContext.players.length < 2}
			on:click={startGame}>{$t('game-start-button')}</button
		>
	{:else if gameContext.state === GameStates.PLAYING}
		<h1 class="target">{gameContext.players[currentPlayerIndex].name}</h1>

		<article>
			<h2>{gameCards[currentCardIndex].title}</h2>
			<p>
				{gameCards[currentCardIndex].description}
			</p>
			{#if gameCards[currentCardIndex].targetPlayer}
				<b>{$t('target')}: {getTarget(currentCardIndex, currentPlayerIndex)}</b>
			{/if}
		</article>

		{#each events as event}
			{#if event.ended === true}
				<h1 class="event-text">{event.person}, {$t('can-stop-the-mission')} {event.title}</h1>
			{/if}
		{/each}
		{#if currentCardIndex + 1 < 29}
			<button class="button" on:click={showNextCard}>{$t('next-card')}</button>
		{:else if currentCardIndex + 1 === 29}
			<button class="button" on:click={showNextCard}>{$t('last-card')}</button>
		{:else if currentCardIndex + 1 === 30}
			<button class="button button-red" on:click={showNextCard}>{$t('game-over')}</button>
		{/if}
		<p class="game-status">{currentCardIndex + 1}/{cardsInGame}</p>
	{:else if gameContext.state === GameStates.GAME_OVER}
		<h1>{$t('game-over')}</h1>
		<button
			class="button"
			on:click={() => {
				changeGameState(GameStates.LOBBY);
				events = [];
			}}>{$t('back-to-start')}</button
		>
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

	.reset-button {
		position: absolute;
		top: 10px;
		right: 10px;
		background-color: transparent;
		border: none;
		font-size: 36px;
		cursor: pointer;
		color: #333;
	}

	.reset-button:hover {
		color: #2980b9;
	}

	.language-selector {
		position: absolute;
		top: 0;
		left: 0;
		margin: 10px;
		width: 20%;
	}
</style>
