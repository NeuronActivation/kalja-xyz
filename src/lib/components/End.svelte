<script lang="ts">
	import { t } from 'svelte-i18n';
	import { gameStore } from '$lib/stores/gameStore';
</script>

<h1>{$t('game-over')}</h1>

<div class="button-container">
	<button class="pico-background-jade-500" on:click={gameStore.startGame}>{$t('replay')}</button>
	<button class="pico-background-red-500" on:click={gameStore.reset}>{$t('back-to-start')}</button>
</div>

<style>
	.button-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 1rem;
	}

	.button-container button {
		margin: 0.5rem 0;
		padding: 0.5rem 1rem;
	}
</style>
