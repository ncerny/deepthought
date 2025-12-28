<script lang="ts">
	import '../app.css';
	import AudioController from '$lib/components/AudioController.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="description" content="Ask Deep Thought, the second greatest computer in the Universe of Time and Space, your most profound questions." />
	<title>Deep Thought</title>
</svelte:head>

<main>
	{@render children()}
</main>

<AudioController />

<style>
	main {
		width: 100%;
		max-width: var(--max-width);
		padding: var(--spacing-md);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
