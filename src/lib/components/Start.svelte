<script lang="ts">
	import { t } from 'svelte-i18n';
	import { ApplicationState } from '$lib/constants/applicationState';
	import { gameStore } from '$lib/stores/gameStore';
</script>

<h1>{$t('title')}</h1>
<button on:click={() => gameStore.changeGameState(ApplicationState.LOBBY)}>
	{$t('main-menu-start-button')}
</button>
