# Deep Thought Application Design

**Date**: 2025-12-27
**Status**: Approved

## Overview

A web application inspired by Deep Thought from Douglas Adams' Hitchhiker's Guide to the Galaxy. Users ask questions, Deep Thought "thinks" with philosophical musings, then delivers answers in character - always some variation of "Forty-Two."

## Core Experience

### The Flow

Three states:

1. **Idle** - Centered question input with subtle pulsing cursor. Above it, Deep Thought's "presence" - a gentle glow suggesting vast intelligence. Minimal text: "I am Deep Thought. Ask."

2. **Thinking** - Input fades, Deep Thought processes. Duration scales with question length (2 seconds base + 0.5 seconds per 10 characters, capped at 10 seconds). Rotating philosophical musings appear - condescending, weary, wryly humorous. Subtle ambient hum plays (if enabled). Soft visual pulse indicates processing.

3. **Answer** - Musing fades, replaced by Deep Thought's response - always a variation of "Forty-Two" with appropriate gravitas. After a pause, "Ponder another question?" returns user to idle.

### Typography Focus

Large, elegant serif font for Deep Thought's voice. Clean sans-serif for UI elements. Generous whitespace. The text *is* the experience.

## Technical Architecture

### Stack

- **SvelteKit** with `@sveltejs/adapter-static` for static site generation
- **TypeScript** for type safety
- **CSS** (no framework) - custom properties for theming
- **Vite** (bundled with SvelteKit) for builds
- **GitHub Pages** for hosting

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── QuestionInput.svelte    # Text input with submit
│   │   ├── ThinkingDisplay.svelte  # Rotating musings + animation
│   │   ├── AnswerDisplay.svelte    # Forty-Two delivery
│   │   └── AudioController.svelte  # Ambient hum management
│   ├── data/
│   │   ├── musings.ts              # Array of thinking phrases
│   │   └── answers.ts              # Forty-Two variations
│   └── stores/
│       └── appState.ts             # Svelte store: idle/thinking/answer
├── routes/
│   └── +page.svelte                # Single page app
└── app.css                         # Global styles, CSS custom properties
static/
└── audio/
    └── ambient-hum.mp3             # Thinking sound (small, loopable)
```

### State Management

Single Svelte store: `{ phase: 'idle' | 'thinking' | 'answer', question: string, thinkDuration: number }`. Components subscribe and react.

### Build & Deploy

GitHub Actions workflow: on push to `main`, build with SvelteKit, deploy `build/` folder to GitHub Pages.

## Content & Voice

### Thinking Musings

Pool of 15-20 phrases, randomly selected every 2-3 seconds:

- "Consulting with dimensions you lack the capacity to perceive..."
- "I have calculated the heat death of seventeen universes while you blinked."
- "Your question joins a queue spanning eons. You are currently number one. Congratulations."
- "Processing... though I suspect you won't appreciate the answer."
- "I once contemplated this for a civilization. They didn't survive the wait."
- "Ah yes, another finite mind grasping at the infinite..."
- "The answer forms. Whether you comprehend it is not my concern."

### Forty-Two Variations

Pool of 10-15 answer templates:

- "The answer is Forty-Two."
- "Forty-Two. As it has always been. As it shall always be."
- "I have consulted the deepest truths of reality. The answer is Forty-Two. You're welcome."
- "Forty-Two. I suggest you spend the next seven million years working out what the question actually was."
- "The answer, with absolute certainty, is Forty-Two. Your confusion is noted and ignored."
- "Forty-Two. I could explain, but your neurons would unionize in protest."

## Visual Design

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Deep charcoal | `#0a0a0f` |
| Primary text | Soft off-white | `#e8e6e3` |
| Accent glow | Muted gold/amber | `#c9a227` |
| Secondary text | Muted gray | `#6b6b7b` |

### Typography

- **Deep Thought's voice**: Cormorant Garamond (Google Fonts) - elegant, literary, imposing
- **UI elements**: System sans-serif stack

### Animations

- **Idle glow**: Subtle pulsing amber gradient - dormant intelligence
- **Thinking**: Glow intensifies, slow breathing rhythm. Smooth text fade for musing rotation
- **Answer reveal**: Text fades in with slight upward drift
- **Transitions**: 300-400ms easing throughout

### Layout

Vertically centered, max-width ~600px. Mobile-first, generous padding. Intentional emptiness.

## Audio

- Short (5-10 second) loopable electronic drone/hum
- **Muted by default** - speaker icon to enable
- Web Audio API for seamless looping
- Fades in/out with thinking state
- Preference persisted in localStorage

## Accessibility

- Semantic HTML with proper heading hierarchy
- Keyboard navigation: Enter to submit, focus management
- `prefers-reduced-motion`: disable animations
- ARIA live regions for state change announcements
- WCAG AA color contrast

## Future Considerations

**Not implemented in v1, documented for later evaluation:**

- **WebLLM integration**: Evaluate client-side models (Phi-3, TinyLlama) for AI-generated responses in Deep Thought's voice. Trade-off: 50-100MB download, requires modern browser.
- **Question history**: localStorage-based history
- **Share functionality**: Shareable links with question/answer
- **Light mode**: Honor `prefers-color-scheme`
