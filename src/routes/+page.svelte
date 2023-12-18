<script lang="ts">
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
			const response = await fetch('/questions.json');
			const data = await response.json();

			if (data.questions.length >= cardsInGame) {
				// Shuffle the array.
				const shuffledData = data.questions.sort(() => Math.random() - 0.5);

				// Select the amount of entried needed for the game.
				gameCards = shuffledData.slice(0, cardsInGame);
			} else {
				console.error('Data does not have enough entries');
			}
		} catch (error) {
			console.error('Error fetching data: ', error);
		}
		changeGameState(GameStates.PLAYING);

		currentCardIndex = 0;
		currentPlayerIndex = 0;
	}

	function addPlayer(playerName: string) {
		const newPlayer: Player = { id: gameContext.players.length + 1, name: playerName };
		gameContext.players = [...gameContext.players, newPlayer];
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

		if (currentPlayerIndex >= gameContext.players.length) {
			currentPlayerIndex = 0;
		}

		if (currentCardIndex >= cardsInGame) {
			changeGameState(GameStates.GAME_OVER);
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

{#if gameContext.state === GameStates.LOBBY}
	<h1>Juomapeli</h1>
	<button on:click={() => changeGameState(GameStates.ADDING_PLAYERS)}>Aloita</button>
{:else if gameContext.state === GameStates.ADDING_PLAYERS}
	<h1>Lisää pelaajien nimet</h1>

	<input
		type="text"
		bind:value={playerName}
		placeholder="Syötä pelaajan nimi"
		on:keypress={handleKeyPress}
	/>

	<!-- Display added players -->
	{#if gameContext.players.length > 0}
		<h2>Pelaajat lisätty:</h2>
		<ul>
			{#each gameContext.players as player (player.id)}
				<li>{player.name}</li>
			{/each}
		</ul>
	{/if}

	<button on:click={startGame}>Aloita ryyppääminen</button>
{:else if gameContext.state === GameStates.PLAYING}
	<div>
		<h2>{gameCards[currentCardIndex].title}</h2>
		<p>Kohde: {gameContext.players[currentPlayerIndex].name}</p>
		<p>
			{gameCards[currentCardIndex].description + getTarget(currentCardIndex, currentPlayerIndex)}
		</p>
		<p>{currentCardIndex + 1}/{cardsInGame}</p>
	</div>
	<button on:click={showNextCard}>Seuraava kortti</button>
{:else if gameContext.state === GameStates.GAME_OVER}
	<h1>PELI OHI</h1>
	<button on:click={() => changeGameState(GameStates.LOBBY)}>Takaisin alkuun</button>
{/if}
