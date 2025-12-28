# Detailed Architecture

## Application Overview

Deep Thought is a single-page web application that simulates the iconic computer from Douglas Adams' Hitchhiker's Guide to the Galaxy. Users ask questions, watch Deep Thought "think" with philosophical musings, and receive answers (always variations of "Forty-Two").

## State Machine

The application has three states:

```
┌─────────┐  submit   ┌──────────┐  timeout  ┌────────┐
│  IDLE   │──────────>│ THINKING │──────────>│ ANSWER │
└─────────┘           └──────────┘           └────────┘
     ^                                            │
     └────────────────────────────────────────────┘
                    ask again
```

### State Details

| State | UI | Duration |
|-------|-----|----------|
| IDLE | Question input visible, subtle glow animation | Indefinite |
| THINKING | Input hidden, rotating musings, intensified glow | 2-10 seconds (scales with question length) |
| ANSWER | Answer displayed with gravitas, "ask again" prompt | Until user interaction |

## Component Architecture

```
+page.svelte
├── AppContainer
│   ├── AudioController (ambient hum, muted by default)
│   ├── DeepThoughtPresence (glow/visual indicator)
│   └── ContentArea
│       ├── QuestionInput (visible in IDLE)
│       ├── ThinkingDisplay (visible in THINKING)
│       └── AnswerDisplay (visible in ANSWER)
```

## Data Flow

1. User enters question in `QuestionInput`
2. On submit, store updates: `phase: 'thinking'`, `question: <input>`, calculates `thinkDuration`
3. `ThinkingDisplay` subscribes to store, shows rotating musings for `thinkDuration`
4. Timer expires, store updates: `phase: 'answer'`
5. `AnswerDisplay` shows random Forty-Two variation
6. User clicks "ask again", store resets to `phase: 'idle'`

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── QuestionInput.svelte    # Text input with submit handling
│   │   ├── ThinkingDisplay.svelte  # Musing rotation, timing logic
│   │   ├── AnswerDisplay.svelte    # Answer reveal animation
│   │   └── AudioController.svelte  # Web Audio API, localStorage prefs
│   ├── data/
│   │   ├── musings.ts              # Array of thinking phrases (~20)
│   │   └── answers.ts              # Forty-Two variations (~15)
│   └── stores/
│       └── appState.ts             # Svelte writable store
├── routes/
│   └── +page.svelte                # Main page, composes components
└── app.css                         # Global styles, CSS custom properties

static/
└── audio/
    └── ambient-hum.mp3             # 5-10 second loop, small file

.github/
└── workflows/
    └── deploy.yml                  # Build and deploy to GitHub Pages
```

## Styling Architecture

### CSS Custom Properties

```css
:root {
  --color-bg: #0a0a0f;
  --color-text: #e8e6e3;
  --color-accent: #c9a227;
  --color-muted: #6b6b7b;
  --font-voice: 'Cormorant Garamond', serif;
  --font-ui: system-ui, sans-serif;
  --transition-speed: 300ms;
}
```

### Animation Strategy

- CSS transitions for state changes
- CSS keyframes for continuous animations (glow pulse)
- `prefers-reduced-motion` media query respected

## Deployment Pipeline

```
push to main
    │
    v
GitHub Actions triggered
    │
    v
npm install && npm run build
    │
    v
adapter-static outputs to /build
    │
    v
Deploy /build to gh-pages branch
    │
    v
GitHub Pages serves site
```

## Accessibility Considerations

- Semantic HTML structure
- Focus management between states
- ARIA live regions for dynamic content
- Keyboard navigation (Enter to submit)
- Color contrast WCAG AA compliant
- Reduced motion support

## Future Extension Points

- **WebLLM**: `src/lib/ai/` would contain model loading and inference
- **History**: `src/lib/stores/history.ts` with localStorage persistence
- **Sharing**: Query parameter parsing for pre-filled questions
