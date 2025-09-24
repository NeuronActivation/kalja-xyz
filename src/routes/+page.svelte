<script lang="ts">
	import { onMount } from 'svelte';

	import { ApplicationState } from '$lib/constants/applicationState';
	import type { GameState } from '$lib/interfaces/gameState';
	import { gameStore } from '$lib/stores/gameStore';

	import Header from '$lib/components/Header.svelte';
	import Start from '$lib/components/Start.svelte';
	import Lobby from '$lib/components/Lobby.svelte';
	import Game from '$lib/components/Game.svelte';
	import End from '$lib/components/End.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// State of the application.
	let gameState: GameState;
	gameStore.subscribe((value) => (gameState = value));

	onMount(() => {
		gameStore.loadSavedState();
	});
</script>

<Header />
<main class="game-container">
	{#if gameState.state === ApplicationState.START}
		<Start />
	{:else if gameState.state === ApplicationState.LOBBY}
		<Lobby />
	{:else if gameState.state === ApplicationState.PLAYING}
		<Game />
	{:else if gameState.state === ApplicationState.ENDING}
		<End />
	{/if}
</main>
<Footer />

<style>
	:root {
		--nav-height: 80px;
		--footer-height: 80px;
	}
	.game-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - var(--nav-height, 80px) - var(--footer-height, 80px));
		width: 100%;
		padding: var(--spacing);
	}

	/* Ensure proper layout flow */
	:global(body) {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		margin: 0;
	}

	/* Make main content area flexible */
	.game-container {
		flex: 1;
	}
</style>
