<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { appState, question } from '$lib/stores/appState';
	import { getMusingSequence } from '$lib/data/musings';
	import { getRandomAnswer } from '$lib/data/answers';
	import { API_URL } from '$lib/config';

	let currentMusing = $state('');
	let musingIndex = $state(0);
	let musings: string[] = [];
	let musingInterval: ReturnType<typeof setInterval>;

	// Subscribe to question
	let userQuestion = '';
	const unsubQuestion = question.subscribe((q) => {
		userQuestion = q;
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

		// Start fetching AI response immediately
		fetchAIResponse(userQuestion);
	});

	onDestroy(() => {
		clearInterval(musingInterval);
		unsubQuestion();
	});

	// Delay helper for dramatic effect
	function sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async function fetchAIResponse(questionText: string) {
		if (!questionText) {
			appState.setFallbackResponse(getRandomAnswer());
			return;
		}

		try {
			const response = await fetch(`${API_URL}/api/explain`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: questionText }),
			});

			if (!response.ok || !response.body) {
				appState.setFallbackResponse(getRandomAnswer());
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			let firstChunk = true;

			// Queue to buffer incoming chunks for controlled release
			const textQueue: string[] = [];
			let doneReading = false;

			// Read stream into queue
			(async () => {
				while (true) {
					const { done, value } = await reader.read();
					if (done) {
						doneReading = true;
						break;
					}

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
									textQueue.push(parsed.content);
								}
							} catch {
								// Skip malformed JSON
							}
						}
					}
				}
			})();

			// Release text with dramatic delays
			while (!doneReading || textQueue.length > 0) {
				if (textQueue.length > 0) {
					const chunk = textQueue.shift()!;

					if (firstChunk) {
						// First content - transition to answer phase
						appState.startStreaming();
						firstChunk = false;
					}

					// Output character by character for dramatic effect
					for (const char of chunk) {
						appState.appendResponse(char);
						// Variable delay: longer for punctuation, shorter for letters
						const delay = '.!?,;:'.includes(char) ? 150 :
						              char === ' ' ? 40 : 30;
						await sleep(delay);
					}
				} else {
					// Wait for more content
					await sleep(50);
				}
			}

			appState.finishStreaming();
		} catch {
			// API failed - use fallback
			appState.setFallbackResponse(getRandomAnswer());
		}
	}
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
