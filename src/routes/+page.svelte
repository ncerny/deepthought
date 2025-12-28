<script lang="ts">
	import { phase } from '$lib/stores/appState';
	import QuestionInput from '$lib/components/QuestionInput.svelte';
	import ThinkingDisplay from '$lib/components/ThinkingDisplay.svelte';
	import AnswerDisplay from '$lib/components/AnswerDisplay.svelte';

	let currentPhase = $state<'idle' | 'thinking' | 'answer'>('idle');

	// Subscribe to phase changes
	phase.subscribe((p) => {
		currentPhase = p;
	});
</script>

<div class="deep-thought">
	{#if currentPhase === 'idle'}
		<QuestionInput />
	{:else if currentPhase === 'thinking'}
		<ThinkingDisplay />
	{:else if currentPhase === 'answer'}
		<AnswerDisplay />
	{/if}
</div>

<style>
	.deep-thought {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
