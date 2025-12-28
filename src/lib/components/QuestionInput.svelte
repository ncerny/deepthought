<script lang="ts">
	import { appState } from '$lib/stores/appState';

	let question = $state('');
	let inputElement: HTMLTextAreaElement;

	function handleSubmit() {
		if (question.trim()) {
			appState.submitQuestion(question);
			question = '';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	export function focus() {
		inputElement?.focus();
	}
</script>

<div class="input-container fade-in">
	<h1 class="voice voice-large glow">I am Deep Thought.</h1>
	<p class="voice voice-medium muted">Ask.</p>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
		<textarea
			bind:this={inputElement}
			bind:value={question}
			onkeydown={handleKeydown}
			placeholder="What is the meaning of life, the universe, and everything?"
			rows="3"
			aria-label="Your question for Deep Thought"
		></textarea>

		<button type="submit" disabled={!question.trim()} aria-label="Submit your question">
			<span class="voice">Ponder</span>
		</button>
	</form>
</div>

<style>
	.input-container {
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
	}

	h1 {
		margin-bottom: var(--spacing-xs);
	}

	p {
		margin-bottom: var(--spacing-md);
	}

	form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	textarea {
		width: 100%;
		padding: var(--spacing-sm);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--color-muted);
		border-radius: 4px;
		color: var(--color-text);
		font-family: var(--font-ui);
		font-size: 1rem;
		resize: vertical;
		min-height: 80px;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	textarea::placeholder {
		color: var(--color-muted);
		font-style: italic;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent-dim);
	}

	button {
		padding: var(--spacing-sm) var(--spacing-md);
		background: transparent;
		border: 1px solid var(--color-accent);
		border-radius: 4px;
		color: var(--color-accent);
		font-family: var(--font-voice);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	button:hover:not(:disabled) {
		background: var(--color-accent);
		color: var(--color-bg);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
