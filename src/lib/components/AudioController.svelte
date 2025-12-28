<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { phase } from '$lib/stores/appState';

	let isMuted = $state(true);
	let isPlaying = $state(false);

	let audioContext: AudioContext | null = null;
	let oscillator: OscillatorNode | null = null;
	let gainNode: GainNode | null = null;

	const STORAGE_KEY = 'deepthought-audio-muted';

	// Load preference from localStorage
	onMount(() => {
		if (browser) {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored !== null) {
				isMuted = stored === 'true';
			}
		}
	});

	// Subscribe to phase changes
	const unsubPhase = phase.subscribe((p) => {
		if (p === 'thinking') {
			startAudio();
		} else {
			stopAudio();
		}
	});

	onDestroy(() => {
		unsubPhase();
		stopAudio();
		if (audioContext) {
			audioContext.close();
		}
	});

	function initAudio() {
		if (!browser || audioContext) return;

		audioContext = new AudioContext();
		gainNode = audioContext.createGain();
		gainNode.gain.value = 0;
		gainNode.connect(audioContext.destination);
	}

	function startAudio() {
		if (!browser || isMuted) return;

		initAudio();
		if (!audioContext || !gainNode) return;

		// Resume context if suspended (browser autoplay policy)
		if (audioContext.state === 'suspended') {
			audioContext.resume();
		}

		// Create a deep ambient drone
		oscillator = audioContext.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = 55; // Low A1

		// Add a second oscillator for richness
		const oscillator2 = audioContext.createOscillator();
		oscillator2.type = 'sine';
		oscillator2.frequency.value = 82.5; // E2, perfect fifth above

		// Create gain nodes for mixing
		const gain1 = audioContext.createGain();
		const gain2 = audioContext.createGain();
		gain1.gain.value = 0.15;
		gain2.gain.value = 0.08;

		oscillator.connect(gain1);
		oscillator2.connect(gain2);
		gain1.connect(gainNode);
		gain2.connect(gainNode);

		// Fade in
		gainNode.gain.setValueAtTime(0, audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.5);

		oscillator.start();
		oscillator2.start();
		isPlaying = true;

		// Store reference to stop later
		(oscillator as any)._companion = oscillator2;
	}

	function stopAudio() {
		if (!audioContext || !gainNode || !oscillator) return;

		// Fade out
		gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

		// Stop oscillators after fade
		setTimeout(() => {
			if (oscillator) {
				oscillator.stop();
				(oscillator as any)._companion?.stop();
				oscillator = null;
			}
			isPlaying = false;
		}, 300);
	}

	function toggleMute() {
		isMuted = !isMuted;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, String(isMuted));
		}

		if (isMuted && isPlaying) {
			stopAudio();
		}
	}
</script>

<button
	class="audio-toggle"
	onclick={toggleMute}
	aria-label={isMuted ? 'Enable ambient sound' : 'Mute ambient sound'}
	title={isMuted ? 'Enable sound' : 'Mute sound'}
>
	{#if isMuted}
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
			<line x1="23" y1="9" x2="17" y2="15"></line>
			<line x1="17" y1="9" x2="23" y2="15"></line>
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
			<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
		</svg>
	{/if}
</button>

<style>
	.audio-toggle {
		position: fixed;
		bottom: var(--spacing-md);
		right: var(--spacing-md);
		padding: var(--spacing-xs);
		background: transparent;
		border: 1px solid var(--color-muted);
		border-radius: 4px;
		color: var(--color-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.audio-toggle:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
</style>
