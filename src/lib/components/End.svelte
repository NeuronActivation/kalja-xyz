<script lang="ts">
	import { t } from 'svelte-i18n';
	import { gameStore } from '$lib/stores/gameStore';
</script>

<h1>{$t('game-over')}</h1>
<button on:click={gameStore.startGame}>{$t('replay')}</button>
<button on:click={gameStore.reset} style="margin-top: 1rem;">
	{$t('back-to-start')}
</button>
