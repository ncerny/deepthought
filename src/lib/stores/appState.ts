import { writable, derived } from 'svelte/store';

export type Phase = 'idle' | 'thinking' | 'answer';

export interface AppState {
	phase: Phase;
	question: string;
	thinkDuration: number;
}

const initialState: AppState = {
	phase: 'idle',
	question: '',
	thinkDuration: 0
};

function createAppState() {
	const { subscribe, set, update } = writable<AppState>(initialState);

	return {
		subscribe,

		/**
		 * Submit a question and begin thinking
		 */
		submitQuestion: (question: string) => {
			const duration = calculateThinkDuration(question);
			update((state) => ({
				...state,
				phase: 'thinking',
				question: question.trim(),
				thinkDuration: duration
			}));
		},

		/**
		 * Transition to answer phase
		 */
		showAnswer: () => {
			update((state) => ({
				...state,
				phase: 'answer'
			}));
		},

		/**
		 * Reset to idle state for a new question
		 */
		reset: () => {
			set(initialState);
		}
	};
}

/**
 * Calculate thinking duration based on question length
 * Base: 4 seconds
 * Add: 1 second per 10 characters
 * Max: 20 seconds
 */
function calculateThinkDuration(question: string): number {
	const baseTime = 4000; // 4 seconds in ms
	const charBonus = Math.floor(question.length / 10) * 1000; // 1s per 10 chars
	const total = baseTime + charBonus;
	return Math.min(total, 20000); // Cap at 20 seconds
}

export const appState = createAppState();

// Derived stores for convenience
export const phase = derived(appState, ($state) => $state.phase);
export const question = derived(appState, ($state) => $state.question);
export const thinkDuration = derived(appState, ($state) => $state.thinkDuration);
