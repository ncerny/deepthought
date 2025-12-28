<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	interface Orb {
		id: number;
		x: number;
		y: number;
		size: number;
		duration: number;
	}

	let orbs = $state<Orb[]>([]);
	let nextId = 0;
	let interval: ReturnType<typeof setInterval>;

	onMount(() => {
		if (!browser) return;

		// Spawn an orb every 1-2 seconds
		interval = setInterval(() => {
			spawnOrb();
		}, 1500);

		// Spawn a few initial orbs
		spawnOrb();
		setTimeout(() => spawnOrb(), 500);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	function spawnOrb() {
		const orb: Orb = {
			id: nextId++,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: 40 + Math.random() * 80, // 40-120px
			duration: 3 + Math.random() * 2 // 3-5 seconds
		};

		orbs = [...orbs, orb];

		// Remove orb after animation completes
		setTimeout(() => {
			orbs = orbs.filter(o => o.id !== orb.id);
		}, orb.duration * 1000);
	}
</script>

<div class="ambient-container" aria-hidden="true">
	{#each orbs as orb (orb.id)}
		<div
			class="orb"
			style="
				left: {orb.x}%;
				top: {orb.y}%;
				width: {orb.size}px;
				height: {orb.size}px;
				animation-duration: {orb.duration}s;
			"
		></div>
	{/each}
</div>

<style>
	.ambient-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;
		z-index: -1;
	}

	.orb {
		position: absolute;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			var(--color-accent) 0%,
			rgba(201, 162, 39, 0.3) 30%,
			transparent 70%
		);
		filter: blur(20px);
		opacity: 0;
		animation: fade-pulse ease-in-out forwards;
		transform: translate(-50%, -50%);
	}

	@keyframes fade-pulse {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8);
		}
		50% {
			opacity: 0.4;
			transform: translate(-50%, -50%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.9);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.orb {
			animation: none;
			opacity: 0.15;
		}
	}
</style>
