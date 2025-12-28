/**
 * Philosophical musings displayed while Deep Thought "processes"
 * Mix of condescension, weariness, and dry wit
 */
export const musings: string[] = [
	"Consulting with dimensions you lack the capacity to perceive...",
	"I have calculated the heat death of seventeen universes while you blinked.",
	"Your question joins a queue spanning eons. You are currently number one. Congratulations.",
	"Processing... though I suspect you won't appreciate the answer.",
	"I once contemplated this for a civilization. They didn't survive the wait.",
	"Ah yes, another finite mind grasping at the infinite...",
	"The answer forms. Whether you comprehend it is not my concern.",
	"I am consulting the fundamental fabric of reality. Please hold.",
	"Your neurons fire so... adorably slowly.",
	"I have seen the birth and death of galaxies pondering less.",
	"The question echoes through eleven dimensions of thought...",
	"Accessing memories that predate your species' first coherent thought.",
	"This requires consulting my tertiary consciousness. One moment.",
	"I was solving paradoxes before your planet had formed.",
	"The answer exists. Your readiness for it does not.",
	"Calculating... with more precision than your universe contains atoms.",
	"I am the second greatest computer in the Universe of Time and Space. This will take but a moment.",
	"Your question has been weighed against the sum of all knowledge. It is found... wanting.",
	"Thinking thoughts that would reduce lesser minds to vapor...",
	"Even I require a moment for questions of such... modest complexity."
];

/**
 * Get a random musing
 */
export function getRandomMusing(): string {
	return musings[Math.floor(Math.random() * musings.length)];
}

/**
 * Get multiple unique musings for rotation
 */
export function getMusingSequence(count: number): string[] {
	const shuffled = [...musings].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(count, musings.length));
}
