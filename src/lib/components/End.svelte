<script lang="ts">
import { t } from 'svelte-i18n';
import { gameStore } from '$lib/stores/gameStore';
</script>

<h1>{$t('game-over')}</h1>

<div class="button-container">
	<button class="button button--large button--gold" on:click={gameStore.replay}>{
		$t('replay')
	}</button>
	<button class="button button--ghost" on:click={gameStore.reset}>
		{$t('back-to-start')}
	</button>
</div>

<style>
h1 {
	font-size: clamp(3rem, 12vw, 6rem);
	line-height: 1;
	padding: 0 0.15em 0.15em;
	color: var(--foam);
	text-align: center;
	transform: rotate(-3deg);
}

/* The gold ring would vanish around the gold button on the empty glass. */
.button-container {
	--focus-inner: var(--foam);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin-top: 0.75rem;
}

.button-container :global(.button) {
	min-width: 13rem;
}
</style>
