<script lang="ts">
	import { base } from '$app/paths';
	import { cardsInGame } from '$lib/constants/cardsInGame';
	import type { GameCard } from '$lib/models/card';

	let gameCards: GameCard[] = [];

	// Input field value.
	let playerName = '';

	// Which card is currently in play.
	let currentCardIndex = 0;

	// Which player the question is targeting.
	let currentPlayerIndex = 0;

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

	function changeGameState(newState: GameStates) {
		gameContext.state = newState;
	}

	async function startGame() {
		try {
			const response = await fetch(`${base}/cards/finnish.json`);
			const data = await response.json();

			if (data.cards.length >= cardsInGame) {
				// Shuffle the array.
				const shuffledData = data.cards.sort(() => Math.random() - 0.5);

				// Select the amount of entried needed for the game.
				gameCards = shuffledData.slice(0, cardsInGame);
			} else {
				console.error('Data does not have enough entries');
			}
		} catch (error) {
			console.error('Error fetching data: ', error);
		}

		currentCardIndex = 0;
		currentPlayerIndex = 0;

		changeGameState(GameStates.PLAYING);
	}

	function addPlayer(playerName: string) {
		const newPlayer: Player = { id: gameContext.players.length + 1, name: playerName };
		gameContext.players = [...gameContext.players, newPlayer];
	}

	function removePlayer(playerId: number) {
		gameContext.players = gameContext.players.filter((player) => player.id !== playerId);
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
</script>

<div class="game-container">
	{#if gameContext.state === GameStates.LOBBY}
		<h1>Santerin Juomapeli v2</h1>
		<button class="button" on:click={() => changeGameState(GameStates.ADDING_PLAYERS)}
			>Aloita</button
		>
	{:else if gameContext.state === GameStates.ADDING_PLAYERS}
		<h2>Lisää pelaajien nimet</h2>
		<input
			type="text"
			bind:value={playerName}
			placeholder="Syötä pelaajan nimi"
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
		<button class="button button-green" disabled={gameContext.players.length < 2} on:click={startGame}>Aloita ryyppääminen</button>
	{:else if gameContext.state === GameStates.PLAYING}
		<h1 class="target">{gameContext.players[currentPlayerIndex].name}</h1>

		<article>
			<h2>{gameCards[currentCardIndex].title}</h2>
			<p>
				{gameCards[currentCardIndex].description + getTarget(currentCardIndex, currentPlayerIndex)}
			</p>
		</article>

		{#each events as event}
			{#if event.ended === true}
				<h1 class="event-text">{event.person}, voit lopetaa tehtävän {event.title}</h1>
			{/if}
		{/each}
		{#if currentCardIndex + 1 < 29}
			<button class="button" on:click={showNextCard}>Seuraava kortti</button>
		{:else if currentCardIndex + 1 === 29}
			<button class="button" on:click={showNextCard}>Viimeinen kortti</button>
		{:else if currentCardIndex + 1 === 30}
			<button class="button button-red" on:click={showNextCard}>Peli ohi</button>
		{/if}
		<p class="game-status">{currentCardIndex + 1}/{cardsInGame}</p>
	{:else if gameContext.state === GameStates.GAME_OVER}
		<h1>PELI OHI</h1>
		<button
			class="button"
			on:click={() => {
				changeGameState(GameStates.LOBBY);
				events = [];
			}}>Takaisin alkuun</button
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
</style>
