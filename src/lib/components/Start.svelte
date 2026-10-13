<script lang="ts">
import { tick } from 'svelte';
import { t } from 'svelte-i18n';
import { ApplicationState } from '$lib/constants/applicationState';
import { gameStore } from '$lib/stores/gameStore';
import santerinJuomapeli from '$lib/assets/santerin-juomapeli.webp';

/** Quick taps on the wordmark that show the original Santerin Juomapeli logo. */
const LOGO_TAPS = 5;
const TAP_WINDOW_MS = 1500;

let titleEl: HTMLElement;
let dialog: HTMLDialogElement;
let taps = 0;
let lastTap = 0;
let logoOpen = false;

function tapTitle() {
	const now = Date.now();
	taps = now - lastTap < TAP_WINDOW_MS ? taps + 1 : 1;
	lastTap = now;

	if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
		titleEl.animate(
			[
				{ transform: 'rotate(-4deg) scale(0.93)' },
				{ transform: 'rotate(-4deg) scale(1)' },
			],
			{ duration: 220, easing: 'cubic-bezier(0.2, 0.9, 0.25, 1.4)' },
		);
	}

	if (taps >= LOGO_TAPS) {
		taps = 0;
		logoOpen = true;
		// Render the contents first so the close button can take focus.
		tick().then(() => dialog.showModal());
	}
}

/** Closes the dialog when its backdrop is clicked. */
function clickDialog(event: MouseEvent) {
	if (event.target === dialog) dialog.close();
}
</script>

<div class="start-container">
	<!-- Tapping the wordmark is a touch and mouse only extra, so it stays a heading. -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<h1 class="title" bind:this={titleEl} on:click={tapTitle}>{$t('title')}</h1>
	<p class="tagline">{$t('tagline')}</p>
	<button
		class="button button--large start-button"
		on:click={() => gameStore.changeGameState(ApplicationState.LOBBY)}
	>
		{$t('main-menu-start-button')}
	</button>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog
	class="original-logo"
	bind:this={dialog}
	on:click={clickDialog}
	on:close={() => (logoOpen = false)}
>
	{#if logoOpen}
		<img src={santerinJuomapeli} alt="Santerin Juomapeli" width="512" height="512" />
		<h2>Santerin Juomapeli</h2>
		<p>
			{$t('original-logo')}
			<a href="https://github.com/Santerhy/Juomapeli-App" target="_blank" rel="noopener">
				Santerhy
			</a>
		</p>
		<form method="dialog">
			<!-- svelte-ignore a11y_autofocus -->
			<button class="button" autofocus>{$t('close')}</button>
		</form>
	{/if}
</dialog>

<style>
.start-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	padding: 1rem 0 3rem;
}

/* The wordmark is printed on the glass like a brewery logo. */
.title {
	font-size: clamp(3.5rem, 16vw, 8.5rem);
	line-height: 1;
	padding: 0 0.15em 0.12em;
	color: var(--foam);
	transform: rotate(-4deg);
	text-shadow:
		0 0.025em 0 var(--ink),
		0 0.05em 0 var(--ink),
		0 0.075em 0 var(--ink),
		0.01em 0.1em 0 var(--ink),
		0 0.16em 0.14em rgba(70, 30, 0, 0.35);
	-webkit-text-stroke: 0.025em var(--ink);
	paint-order: stroke fill;
	animation: stamp 0.7s cubic-bezier(0.2, 0.9, 0.25, 1.15) both;
	/* Repeated taps shouldn't select the text. */
	-webkit-user-select: none;
	user-select: none;
}

.tagline {
	margin: 1.25rem 0 2.25rem;
	font-size: clamp(1.125rem, 3.5vw, 1.375rem);
	font-weight: 700;
	color: var(--ink);
}

@keyframes stamp {
	from {
		opacity: 0;
		transform: rotate(-4deg) scale(1.25);
	}
}

/* The original logo, shown on a coaster like the game's cards. */
.original-logo {
	width: min(100% - 2rem, 22rem);
	padding: 1.75rem 1.75rem 1.5rem;
	border: 0;
	border-radius: 22px;
	background: var(--paper);
	color: var(--ink);
	text-align: center;
	box-shadow:
		0 4px 0 var(--paper-edge),
		0 24px 48px -12px rgba(11, 17, 48, 0.7);
}

.original-logo[open] {
	animation: drop-in 0.5s cubic-bezier(0.2, 0.9, 0.25, 1.15) both;
}

.original-logo::backdrop {
	background: rgba(20, 28, 51, 0.75);
	-webkit-backdrop-filter: blur(3px);
	backdrop-filter: blur(3px);
}

/* Keep the original's pixels crisp; they are part of its charm. */
img {
	display: block;
	width: 100%;
	height: auto;
	border-radius: 14px;
	image-rendering: pixelated;
	transform: rotate(-3deg);
	box-shadow: 0 10px 20px -10px rgba(11, 17, 48, 0.6);
}

h2 {
	margin: 1.5rem 0 0.4rem;
	font-size: 1.75rem;
}

p {
	margin-bottom: 1.25rem;
	color: var(--ink-soft);
}

@keyframes drop-in {
	from {
		opacity: 0;
		transform: translateY(-24px) rotate(4deg) scale(0.9);
	}
}
</style>
