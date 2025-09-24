<script lang="ts">
	import { t } from 'svelte-i18n';
	import { ApplicationState } from '$lib/constants/applicationState';
	import { gameStore } from '$lib/stores/gameStore';
</script>

<div class="start-container">
	<div class="beer-icon">🍺</div>
	<h1 class="title">{$t('title')}</h1>
	<button class="start-button" on:click={() => gameStore.changeGameState(ApplicationState.LOBBY)}>
		{$t('main-menu-start-button')}
	</button>
</div>

<style>
	.start-container {
		text-align: center;
		padding: 2rem;
	}

	.beer-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		animation: bounce 2s ease-in-out infinite;
	}

	.title {
		margin-bottom: 2rem;
	}

	.start-button {
		font-size: 1.1rem;
		padding: 0.75rem 2rem;
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-8px);
		}
		60% {
			transform: translateY(-4px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beer-icon {
			animation: none;
		}
	}
</style>
