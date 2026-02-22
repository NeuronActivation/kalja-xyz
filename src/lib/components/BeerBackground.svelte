<script lang="ts">
	import { gameStore } from '$lib/stores/gameStore';
	import { ApplicationState } from '$lib/constants/applicationState';

	$: ({ state, currentCardIndex, cardAmount } = $gameStore);

	$: beerLevel = (() => {
		if (state === ApplicationState.ENDING) return 0;
		if (state !== ApplicationState.PLAYING || cardAmount == null || cardAmount === 0) {
			return 100;
		}
		if (cardAmount === 1) return 0;
		return Math.max(0, ((cardAmount - 1 - currentCardIndex) / (cardAmount - 1)) * 100);
	})();
</script>

<div class="beer-background" aria-hidden="true">
	<div class="beer-fill" style:height="{beerLevel}%">
		<div class="foam"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
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

	.bubble:nth-child(2) {
		left: 4%;
		width: 6px;
		height: 6px;
		animation-duration: 4.2s;
		animation-delay: -1s;
	}
	.bubble:nth-child(3) {
		left: 10%;
		width: 10px;
		height: 10px;
		animation-duration: 5.8s;
		animation-delay: -3.2s;
	}
	.bubble:nth-child(4) {
		left: 18%;
		width: 5px;
		height: 5px;
		animation-duration: 3.9s;
		animation-delay: -0.5s;
	}
	.bubble:nth-child(5) {
		left: 25%;
		width: 14px;
		height: 14px;
		animation-duration: 6.5s;
		animation-delay: -2.1s;
	}
	.bubble:nth-child(6) {
		left: 32%;
		width: 8px;
		height: 8px;
		animation-duration: 4.8s;
		animation-delay: -4s;
	}
	.bubble:nth-child(7) {
		left: 40%;
		width: 12px;
		height: 12px;
		animation-duration: 5.3s;
		animation-delay: -1.7s;
	}
	.bubble:nth-child(8) {
		left: 47%;
		width: 6px;
		height: 6px;
		animation-duration: 3.7s;
		animation-delay: -2.8s;
	}
	.bubble:nth-child(9) {
		left: 54%;
		width: 16px;
		height: 16px;
		animation-duration: 7.1s;
		animation-delay: -0.3s;
	}
	.bubble:nth-child(10) {
		left: 60%;
		width: 7px;
		height: 7px;
		animation-duration: 4.4s;
		animation-delay: -3.5s;
	}
	.bubble:nth-child(11) {
		left: 67%;
		width: 11px;
		height: 11px;
		animation-duration: 5.6s;
		animation-delay: -1.2s;
	}
	.bubble:nth-child(12) {
		left: 73%;
		width: 5px;
		height: 5px;
		animation-duration: 3.5s;
		animation-delay: -2.4s;
	}
	.bubble:nth-child(13) {
		left: 79%;
		width: 9px;
		height: 9px;
		animation-duration: 4.9s;
		animation-delay: -0.8s;
	}
	.bubble:nth-child(14) {
		left: 85%;
		width: 13px;
		height: 13px;
		animation-duration: 6.2s;
		animation-delay: -3.9s;
	}
	.bubble:nth-child(15) {
		left: 91%;
		width: 7px;
		height: 7px;
		animation-duration: 4.1s;
		animation-delay: -1.5s;
	}
	.bubble:nth-child(16) {
		left: 7%;
		width: 11px;
		height: 11px;
		animation-duration: 5.5s;
		animation-delay: -4.5s;
	}
	.bubble:nth-child(17) {
		left: 22%;
		width: 6px;
		height: 6px;
		animation-duration: 3.8s;
		animation-delay: -2s;
	}
	.bubble:nth-child(18) {
		left: 44%;
		width: 9px;
		height: 9px;
		animation-duration: 5.1s;
		animation-delay: -0.7s;
	}
	.bubble:nth-child(19) {
		left: 58%;
		width: 15px;
		height: 15px;
		animation-duration: 6.8s;
		animation-delay: -3s;
	}
	.bubble:nth-child(20) {
		left: 76%;
		width: 6px;
		height: 6px;
		animation-duration: 4.3s;
		animation-delay: -1.9s;
	}
	.bubble:nth-child(21) {
		left: 88%;
		width: 10px;
		height: 10px;
		animation-duration: 5.4s;
		animation-delay: -4.8s;
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
