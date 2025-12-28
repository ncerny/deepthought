<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import AudioController from '$lib/components/AudioController.svelte';
	import AmbientGlow from '$lib/components/AmbientGlow.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="description" content="Ask Deep Thought, the second greatest computer in the Universe of Time and Space, your most profound questions." />
	<title>Deep Thought</title>
	<link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16x16.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />
</svelte:head>

<AmbientGlow />

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
