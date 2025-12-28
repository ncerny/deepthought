<script lang="ts">
	import { onMount } from 'svelte';
	import { appState, question } from '$lib/stores/appState';
	import { getRandomAnswer } from '$lib/data/answers';
	import { API_URL } from '$lib/config';

	let answer = $state('');
	let explanation = $state('');
	let showAskAgain = $state(false);
	let userQuestion = $state('');

	// Subscribe to the question
	const unsubQuestion = question.subscribe((q) => {
		userQuestion = q;
	});

	onMount(() => {
		answer = getRandomAnswer();

		// Fetch AI explanation after a short delay
		setTimeout(() => {
			fetchExplanation(userQuestion);
		}, 1000);

		// Show "ask again" prompt after a delay
		setTimeout(() => {
			showAskAgain = true;
		}, 2000);

		return () => {
			unsubQuestion();
		};
	});

	async function fetchExplanation(questionText: string) {
		if (!questionText) return;

		try {
			const response = await fetch(`${API_URL}/api/explain`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: questionText }),
			});

			if (!response.ok || !response.body) return;

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') continue;

						try {
							const parsed = JSON.parse(data);
							if (parsed.content) {
								explanation += parsed.content;
							}
						} catch {
							// Skip malformed JSON
						}
					}
				}
			}
		} catch {
			// Silent failure - user just sees the answer without explanation
		}
	}

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

	{#if explanation}
		<p class="explanation fade-in">
			{explanation}
		</p>
	{/if}

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

	.explanation {
		font-style: italic;
		font-size: 1rem;
		color: var(--color-muted);
		max-width: 500px;
		line-height: 1.6;
		text-align: center;
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
