<script lang="ts">
	import { gameStore } from '$lib/stores/gameStore';
	import { ApplicationState } from '$lib/constants/applicationState';

	$: ({ state, currentCardIndex, cardAmount } = $gameStore);

	$: beerLevel = (() => {
		if (state === ApplicationState.ENDING) return 0;
		if (state !== ApplicationState.PLAYING || cardAmount == null || cardAmount === 0) {
			return 100;
		}
		return Math.max(0, ((cardAmount - 1 - currentCardIndex) / (cardAmount - 1)) * 100);
	})();

	function randomBetween(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	const bubbles = Array.from({ length: 20 }, () => ({
		left: randomBetween(2, 95),
		size: randomBetween(5, 16),
		duration: randomBetween(3.5, 7.2),
		delay: -randomBetween(0, 5),
	}));
</script>

<div class="beer-background" aria-hidden="true">
	<div class="beer-fill" style:height="{beerLevel}%">
		<div class="foam"></div>
		{#each bubbles as { left, size, duration, delay }}
			<div
				class="bubble"
				style:left="{left}%"
				style:width="{size}px"
				style:height="{size}px"
				style:animation-duration="{duration}s"
				style:animation-delay="{delay}s"
			>
			</div>
		{/each}
	</div>
</div>

<style>
	.beer-background {
		position: fixed;
		inset: 0;
		background: #1a0d00;
		z-index: -1;
		overflow: hidden;
	}

	.beer-fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(to top, #7a4800 0%, #b8720a 35%, #d9931a 65%, #f0b830 100%);
		transition: height 4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.foam {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 60px;
		background:
			radial-gradient(ellipse at 20% 0%, rgba(255, 252, 235, 0.95) 0%, transparent 60%),
			radial-gradient(ellipse at 50% 0%, rgba(255, 250, 225, 0.9) 0%, transparent 55%),
			radial-gradient(ellipse at 80% 0%, rgba(255, 252, 235, 0.92) 0%, transparent 60%),
			radial-gradient(ellipse at 35% 0%, rgba(255, 248, 210, 0.85) 0%, transparent 50%),
			radial-gradient(ellipse at 65% 0%, rgba(255, 250, 220, 0.88) 0%, transparent 52%);
		animation: foam-sway 6s ease-in-out infinite;
	}

	.bubble {
		position: absolute;
		bottom: -10%;
		border-radius: 50%;
		background: rgba(255, 245, 190, 0.3);
		border: 1px solid rgba(255, 245, 190, 0.55);
		animation: rise linear infinite;
	}

	@keyframes rise {
		0% {
			bottom: -10%;
			opacity: 0;
			transform: translateX(0);
		}
		15% {
			opacity: 0.75;
		}
		50% {
			transform: translateX(-6px);
		}
		85% {
			opacity: 0.5;
		}
		100% {
			bottom: 105%;
			opacity: 0;
			transform: translateX(8px);
		}
	}

	@keyframes foam-sway {
		0%, 100% {
			transform: scaleX(1);
		}
		50% {
			transform: scaleX(1.02) translateX(4px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bubble,
		.foam {
			animation: none;
		}

		.beer-fill {
			transition: none;
		}
	}
</style>
