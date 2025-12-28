<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { appState, thinkDuration } from '$lib/stores/appState';
	import { getMusingSequence } from '$lib/data/musings';

	let currentMusing = $state('');
	let musingIndex = $state(0);
	let musings: string[] = [];
	let musingInterval: ReturnType<typeof setInterval>;
	let thinkTimeout: ReturnType<typeof setTimeout>;

	// Subscribe to think duration
	let duration = 0;
	const unsubDuration = thinkDuration.subscribe((d) => {
		duration = d;
	});

	onMount(() => {
		// Get a sequence of musings
		musings = getMusingSequence(10);
		currentMusing = musings[0];

		// Rotate musings every 2.5 seconds
		musingInterval = setInterval(() => {
			musingIndex = (musingIndex + 1) % musings.length;
			currentMusing = musings[musingIndex];
		}, 2500);

		// Transition to answer after think duration
		thinkTimeout = setTimeout(() => {
			appState.showAnswer();
		}, duration);
	});

	onDestroy(() => {
		clearInterval(musingInterval);
		clearTimeout(thinkTimeout);
		unsubDuration();
	});
</script>

<div class="thinking-container" role="status" aria-live="polite">
	<div class="glow-orb thinking" aria-hidden="true"></div>

	<p class="voice voice-medium musing fade-in" aria-label="Deep Thought is thinking">
		{currentMusing}
	</p>
</div>

<style>
	.thinking-container {
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.glow-orb {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			var(--color-accent) 0%,
			var(--color-accent-dim) 40%,
			transparent 70%
		);
		filter: blur(20px);
	}

	.musing {
		max-width: 100%;
		min-height: 3em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Override fade-in to be continuous for musing changes */
	.musing {
		animation: musing-fade 2.5s ease-in-out infinite;
	}

	@keyframes musing-fade {
		0%, 100% {
			opacity: 0.7;
		}
		20%, 80% {
			opacity: 1;
		}
	}
</style>
