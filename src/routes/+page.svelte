<script lang="ts">
	import { get } from 'svelte/store';
	import { cardsInGame } from '$lib/constants/cardsInGame';
	import { Language } from '$lib/languages/language';
	import { loadLanguages, languageData } from '$lib/languages/load';
	import { getLocale } from '$lib/languages/translation';
	import type { Card } from '$lib/models/card';
	import { onMount } from 'svelte';

	let gameCards: Card[] = [];

	// Input field value.
	let playerName = '';

	// Which card is currently in play.
	let currentCardIndex = 0;

	// Which player the question is targeting.
	let currentPlayerIndex = 0;

	// The language the application is using.
	let currentLanguage = Language.FI;

	let UIElements = {
		// The main title of the application.
		gameTitle: '',

		// Text of the main menu "Start" button.
		mainMenuStartButtonText: '',

		// Text that says "Add player names".
		addPlayerNames: '',

		// Add singular name
		addPlayerName: '',

		// Button text that says "Let's get drinking".
		gameStartButtonText: '',

		// Text that says: "You can stop the mission".
		canStopTheMission: '',

		// Button that says "Next card"
		nextCardButtonText: '',

		// Button that says "Last card".
		lastCardButtonText: '',

		// Cards with targets needs this.
		target: '',

		// Text that says "Game over"
		gameOver: '',

		// Button that takes us back to start.
		backToStart: ''
	};
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
		await loadLanguages();
		await updateUI();

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
		await loadLanguages();
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

	async function changeLanguage(lang: Language) {
		currentLanguage = lang;
		await updateUI();
	}

	async function updateLocale(key: string): Promise<string> {
		const locale = await getLocale(key, currentLanguage);
		return locale !== undefined ? locale : '';
	}

	async function updateUI() {
		await getCards();
		UIElements.gameTitle = await updateLocale('title');
		UIElements.mainMenuStartButtonText = await updateLocale('main-menu-start-button');
		UIElements.addPlayerNames = await updateLocale('add-player-names');
		UIElements.addPlayerName = await updateLocale('add-player-name');
		UIElements.gameStartButtonText = await updateLocale('game-start-button');
		UIElements.canStopTheMission = await updateLocale('can-stop-the-mission');
		UIElements.target = await updateLocale('target');
		UIElements.nextCardButtonText = await updateLocale('next-card');
		UIElements.lastCardButtonText = await updateLocale('last-card');
		UIElements.gameOver = await updateLocale('game-over');
		UIElements.backToStart = await updateLocale('back-to-start');
	}
</script>

<select
	class="language-selector"
	bind:value={currentLanguage}
	on:change={() => changeLanguage(currentLanguage)}
>
	{#each Object.values(Language) as language}
		<option value={language}>{language}</option>
	{/each}
</select>

<div class="game-container">
	<button class="reset-button" on:click={resetGame} title="Reset Game">
		&#x21bb; <!-- Unicode for a circular reset icon -->
	</button>

	{#if gameContext.state === GameStates.LOBBY}
		<h1>{UIElements.gameTitle}</h1>
		<button class="button" on:click={() => changeGameState(GameStates.ADDING_PLAYERS)}
			>{UIElements.mainMenuStartButtonText}</button
		>
	{:else if gameContext.state === GameStates.ADDING_PLAYERS}
		<h2>{UIElements.addPlayerNames}</h2>
		<input
			type="text"
			bind:value={playerName}
			placeholder={UIElements.addPlayerName}
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
			on:click={startGame}>{UIElements.gameStartButtonText}</button
		>
	{:else if gameContext.state === GameStates.PLAYING}
		<h1 class="target">{gameContext.players[currentPlayerIndex].name}</h1>

		<article>
			<h2>{gameCards[currentCardIndex].title}</h2>
			<p>
				{gameCards[currentCardIndex].description}
			</p>
			{#if gameCards[currentCardIndex].targetPlayer}
				<b>{UIElements.target}: {getTarget(currentCardIndex, currentPlayerIndex)}</b>
			{/if}
		</article>

		{#each events as event}
			{#if event.ended === true}
				<h1 class="event-text">{event.person}, {UIElements.canStopTheMission} {event.title}</h1>
			{/if}
		{/each}
		{#if currentCardIndex + 1 < 29}
			<button class="button" on:click={showNextCard}>{UIElements.nextCardButtonText}</button>
		{:else if currentCardIndex + 1 === 29}
			<button class="button" on:click={showNextCard}>{UIElements.lastCardButtonText}</button>
		{:else if currentCardIndex + 1 === 30}
			<button class="button button-red" on:click={showNextCard}>{UIElements.gameOver}</button>
		{/if}
		<p class="game-status">{currentCardIndex + 1}/{cardsInGame}</p>
	{:else if gameContext.state === GameStates.GAME_OVER}
		<h1>{UIElements.gameOver}</h1>
		<button
			class="button"
			on:click={() => {
				changeGameState(GameStates.LOBBY);
				events = [];
			}}>{UIElements.backToStart}</button
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
