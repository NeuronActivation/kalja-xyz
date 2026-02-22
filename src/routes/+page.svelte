<script lang="ts">
	import { onMount } from 'svelte';

	import { ApplicationState } from '$lib/constants/applicationState';
	import type { GameState } from '$lib/interfaces/gameState';
	import { gameStore } from '$lib/stores/gameStore';

	import BeerBackground from '$lib/components/BeerBackground.svelte';
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

<BeerBackground />
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

		/* Make page background transparent so the beer shows through */
		--pico-background-color: transparent;

		/* Warm dark brown for all floating text */
		--pico-color: #2d1200;
		--pico-muted-color: #7a4a00;
		--pico-muted-border-color: rgba(180, 110, 20, 0.25);

		/* Warm cream for cards / articles */
		--pico-card-background-color: rgba(255, 248, 225, 0.93);
		--pico-card-sectioning-background-color: rgba(255, 240, 195, 0.7);
		--pico-card-border-color: rgba(180, 110, 20, 0.2);

		/* Warm form inputs */
		--pico-form-element-background-color: rgba(255, 252, 240, 0.96);
		--pico-form-element-border-color: rgba(180, 110, 20, 0.4);
		--pico-form-element-color: #2d1200;
		--pico-form-element-placeholder-color: #9a6020;
		--pico-form-element-active-background-color: #fffdf5;
		--pico-form-element-active-border-color: #c07820;
		--pico-form-element-focus-color: rgba(192, 120, 32, 0.4);

		/* Warm accordion */
		--pico-accordion-border-color: rgba(180, 110, 20, 0.25);
		--pico-accordion-active-summary-color: #8b4513;
		--pico-accordion-close-summary-color: #2d1200;
		--pico-accordion-open-summary-color: #7a4a00;
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
