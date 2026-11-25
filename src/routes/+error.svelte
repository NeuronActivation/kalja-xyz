<script lang="ts">
import { onMount } from 'svelte';
import { t } from 'svelte-i18n';
import { resolve } from '$app/paths';
import { getStoredLanguage, setLanguage } from '#lib/i18n/localeStorage.ts';

// The error page skips the game's language store, so apply the visitor's chosen language here.
onMount(() => setLanguage(getStoredLanguage()));
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<div class="error-content">
		<hgroup>
			<h1>404</h1>
			<h2>{$t('not-found.title')}</h2>
		</hgroup>
		<p>{$t('not-found.description')}</p>
		<a href={resolve('/')} class="button button--gold">{$t('not-found.return-home')}</a>
	</div>
</main>

<style>
main {
	flex: 1;
	display: grid;
	place-items: center;
	padding: 2rem 1rem;
	background:
		radial-gradient(120% 60% at 50% 0%, var(--dusk-glow) 0%, transparent 70%), var(--dusk);
	color: var(--foam);
}

.error-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
	text-align: center;
}

h1 {
	font-size: clamp(5rem, 22vw, 9rem);
	line-height: 1;
	padding: 0 0.15em 0.1em;
	transform: rotate(-4deg);
}

h2 {
	margin-top: 0.5rem;
	font-family: var(--font-text);
	font-weight: 700;
	font-size: 1.5rem;
}

p {
	color: rgba(255, 249, 238, 0.8);
}
</style>
