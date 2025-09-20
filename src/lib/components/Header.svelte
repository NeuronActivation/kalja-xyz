<script lang="ts">
	import { t, locale } from 'svelte-i18n';
	import { Language } from '$lib/constants/language';
	import { gameStore } from '$lib/stores/gameStore';
	import { languageStore } from '$lib/stores/languageStore';
	import ReloadIcon from '$lib/components/icons/ReloadIcon.svelte';

	/**
	 * Handles language selection change.
	 *
	 * Updates the application's language using `languageStore`
	 * and refreshes the game cards via `gameStore`.
	 *
	 * @param event - The event triggered by selecting a new language.
	 */
	async function changeLanguage(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newLanguage = select.value as Language;
		await languageStore.changeLanguage(newLanguage);
		gameStore.updateCards();
	}
</script>

<select class="language pico-background-azure-500" bind:value={$locale} on:change={changeLanguage}>
	{#each Object.values(Language) as language}
		<option value={language}>{language}</option>
	{/each}
</select>

<button
	class="reset pico-background-azure-500"
	on:click={gameStore.reset}
	title={$t('back-to-start')}
>
	<ReloadIcon size="1.3rem" />
</button>

<style>
	.reset,
	.language {
		position: absolute;
		top: 1rem;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		border-radius: 50%;

		/* Needed for WebKit compatibility */
		-webkit-appearance: none;
		text-align-last: center;
		text-indent: 0;
		padding-left: 0;
		padding-right: 0;
	}

	.reset {
		right: 1rem;
		font-size: 1.3rem;
		line-height: 0;
	}

	.language {
		left: 1rem;
		font-weight: 600;
		background-image: none !important;
	}
</style>
