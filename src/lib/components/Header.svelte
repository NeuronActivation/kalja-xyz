<script lang="ts">
import { locale, t } from 'svelte-i18n';
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

<select
	class="language"
	bind:value={$locale}
	on:change={changeLanguage}
	aria-label={$t('select-language')}
	title={$t('language-selection')}
>
	{#each Object.values(Language) as language}
		<option value={language}>{language}</option>
	{/each}
</select>

<button
	class="reset"
	on:click={gameStore.reset}
	title={$t('back-to-start')}
>
	<ReloadIcon size="1.3rem" />
</button>

<style>
/* Ink discs with a foam rim, readable over both the foam and the empty glass. */
.reset,
.language {
	position: absolute;
	top: 1rem;
	z-index: 1;
	width: 2.75rem;
	height: 2.75rem;
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	border-radius: 50%;
	border: 2px solid rgba(255, 249, 238, 0.85);
	background: var(--ink);
	color: var(--foam);
	box-shadow: 0 6px 14px -6px rgba(11, 17, 48, 0.7);
	cursor: pointer;
	transition: transform 0.12s var(--ease-out);

	/* Needed for WebKit compatibility */
	appearance: none;
	-webkit-appearance: none;
	text-align-last: center;
}

.reset:focus-visible,
.language:focus-visible {
	box-shadow: 0 0 0 3px var(--beer-high);
}

.reset:active,
.language:active {
	transform: scale(0.94);
}

.reset {
	right: 1rem;
	line-height: 0;
}

.language {
	left: 1rem;
	font-weight: 700;
	font-size: 1rem;
	line-height: 1;
}

.language option {
	color: var(--ink);
	background: var(--paper);
}
</style>
