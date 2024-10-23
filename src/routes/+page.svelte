<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';

	import { ApplicationState } from '$lib/constants/applicationState';
	import type { GameState } from '$lib/interfaces/gameState';
	import { gameStore } from '$lib/stores/gameStore';

	import Header from '$lib/components/Header.svelte';
	import Start from '$lib/components/Start.svelte';
	import Lobby from '$lib/components/Lobby.svelte';
	import Game from '$lib/components/Game.svelte';

	// State of the application.
	let gameState: GameState;
	gameStore.subscribe((value) => (gameState = value));

	onMount(() => {
		gameStore.loadSavedState();
	});
</script>

<div class="game-container">
	<Header />
	{#if gameState.state === ApplicationState.START}
		<Start />
	{:else if gameState.state === ApplicationState.LOBBY}
		<Lobby />
	{:else if gameState.state === ApplicationState.PLAYING}
		<Game />
	{:else if gameState.state === ApplicationState.ENDING}
		<h1>{$t('game-over')}</h1>
		<button
			on:click={() => {
				gameStore.changeGameState(ApplicationState.START);
				gameStore.reset();
			}}
		>
			{$t('back-to-start')}
		</button>
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
</style>
