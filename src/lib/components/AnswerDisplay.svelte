<script lang="ts">
	import { onMount } from 'svelte';
	import { appState, question } from '$lib/stores/appState';
	import { getRandomAnswer } from '$lib/data/answers';

	let answer = $state('');
	let showAskAgain = $state(false);
	let userQuestion = $state('');

	// Subscribe to the question
	const unsubQuestion = question.subscribe((q) => {
		userQuestion = q;
	});

	onMount(() => {
		answer = getRandomAnswer();

		// Show "ask again" prompt after a delay
		setTimeout(() => {
			showAskAgain = true;
		}, 2000);

		return () => {
			unsubQuestion();
		};
	});

	function handleAskAgain() {
		appState.reset();
	}
</script>

<div class="answer-container" role="status" aria-live="polite">
	<div class="glow-orb pulse" aria-hidden="true"></div>

	{#if userQuestion}
		<p class="voice voice-small muted question">
			"{userQuestion}"
		</p>
	{/if}

	<p class="voice voice-large answer fade-in glow">
		{answer}
	</p>

	{#if showAskAgain}
		<button class="ask-again fade-in" onclick={handleAskAgain}>
			<span class="voice voice-small">Ponder another question?</span>
		</button>
	{/if}
</div>

<style>
	.answer-container {
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
	}

	.glow-orb {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			var(--color-accent) 0%,
			var(--color-accent-dim) 40%,
			transparent 70%
		);
		filter: blur(15px);
		margin-bottom: var(--spacing-sm);
	}

	.question {
		font-style: italic;
		max-width: 100%;
		word-wrap: break-word;
	}

	.answer {
		margin: var(--spacing-sm) 0;
	}

	.ask-again {
		margin-top: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		background: transparent;
		border: 1px solid var(--color-muted);
		border-radius: 4px;
		color: var(--color-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.ask-again:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
</style>
