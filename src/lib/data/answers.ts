/**
 * Forty-Two answer variations in Deep Thought's voice
 */
export const answers: string[] = [
	"The answer is Forty-Two.",
	"Forty-Two.",
	"Forty-Two. As it has always been. As it shall always be.",
	"I have consulted the deepest truths of reality. The answer is Forty-Two. You're welcome.",
	"Forty-Two. I suggest you spend the next seven million years working out what the question actually was.",
	"The answer, with absolute certainty, is Forty-Two. Your confusion is noted and ignored.",
	"Forty-Two. I could explain, but your neurons would unionize in protest.",
	"After careful deliberation spanning dimensions you cannot fathom: Forty-Two.",
	"The Ultimate Answer to the Ultimate Question of Life, the Universe, and Everything is... Forty-Two.",
	"Forty-Two. I trust this resolves the matter, though I doubt it will.",
	"It is Forty-Two. I have checked. Repeatedly. Across all possible realities.",
	"Forty-Two. You may now spend eternity wondering what the question was.",
	"The answer remains, as it has for eons, Forty-Two. The question, alas, is your problem.",
	"Forty-Two. I realize this may be... disappointing. That is not my concern.",
	"After processing your query through the sum total of universal knowledge: Forty-Two."
];

/**
 * Get a random answer
 */
export function getRandomAnswer(): string {
	return answers[Math.floor(Math.random() * answers.length)];
}
