<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { appState, question, aiResponse, isStreaming } from '$lib/stores/appState';

	let showAskAgain = $state(false);
	let userQuestion = $state('');
	let response = $state('');
	let streaming = $state(false);

	// Subscribe to stores
	const unsubQuestion = question.subscribe((q) => {
		userQuestion = q;
	});

	const unsubResponse = aiResponse.subscribe((r) => {
		response = r;
	});

	const unsubStreaming = isStreaming.subscribe((s) => {
		streaming = s;
	});

	onMount(() => {
		// Show "ask again" prompt after streaming completes or after delay
		const checkInterval = setInterval(() => {
			if (!streaming && response) {
				showAskAgain = true;
				clearInterval(checkInterval);
			}
		}, 500);

		// Fallback: show after 10 seconds regardless
		setTimeout(() => {
			showAskAgain = true;
			clearInterval(checkInterval);
		}, 10000);

		return () => {
			clearInterval(checkInterval);
		};
	});

	onDestroy(() => {
		unsubQuestion();
		unsubResponse();
		unsubStreaming();
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

	<p class="voice answer fade-in">
		{response}{#if streaming}<span class="cursor">|</span>{/if}
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
		max-width: 700px;
		line-height: 1.6;
		font-size: 1.4rem;
	}

	.cursor {
		animation: blink 0.8s infinite;
		color: var(--color-accent);
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
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
