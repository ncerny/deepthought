# Groq AI Integration Design

## Overview

Integrate Groq API (Llama 3.1 8B) to generate Deep Thought's commentary explaining why "Forty-Two" is the answer to each user's question. The classic "Forty-Two" answer remains, with AI-generated explanation streamed below it.

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────┐
│  SvelteKit App  │────▶│  Cloudflare Worker  │────▶│  Groq API   │
│ (GitHub Pages)  │◀────│  (API Proxy)        │◀────│  (Llama 3.1)│
└─────────────────┘     └─────────────────────┘     └─────────────┘
```

- **Cloudflare Worker**: Proxies requests to Groq, keeps API key secure
- **Frontend**: Streams AI response with typewriter effect after showing "Forty-Two"
- **Fallback**: If API fails, user just sees "Forty-Two" (no error messages)

## Cloudflare Worker

### Structure

```
/cloudflare-worker/
├── wrangler.toml
├── src/
│   └── index.ts
└── package.json
```

### Endpoint

`POST /api/explain`

Request:
```json
{ "question": "What is the meaning of life?" }
```

Response: Server-sent events (SSE) stream

### System Prompt

```
You are Deep Thought, the second greatest computer in the Universe of Time
and Space. You have just computed the Answer to the Ultimate Question of
Life, the Universe, and Everything: 42.

The user asked: "{question}"

Explain, in 2-3 sentences, why 42 is the perfect answer to their question.
Be condescending yet weary, as one who has contemplated existence for
7.5 million years. Do not use emojis. Do not break character.
```

### Configuration

`wrangler.toml`:
```toml
name = "deepthought-api"
[vars]
ALLOWED_ORIGIN = "https://ncerny.github.io"
```

Secret (via `wrangler secret put GROQ_API_KEY`):
- GROQ_API_KEY: Groq API key (never in code)

## Frontend Changes

### AnswerDisplay.svelte

New state:
- `explanation: string` - Streamed AI text
- `isStreaming: boolean` - Currently receiving stream
- `streamError: boolean` - API call failed (silent)

Flow:
1. Component mounts, shows "Forty-Two" variation
2. After 1 second delay, fetch to Worker endpoint
3. Read SSE stream, append chunks to `explanation`
4. Text appears with typewriter effect
5. If stream fails, `explanation` stays empty

### New UI Element

```svelte
{#if explanation}
  <p class="explanation">{explanation}</p>
{/if}
```

Styled: muted gold, smaller font, italicized.

### Configuration

`src/lib/config.ts`:
```typescript
export const API_URL = import.meta.env.PROD
  ? 'https://deepthought-api.<account>.workers.dev'
  : 'http://localhost:8787';
```

## Error Handling

All failures are silent - user just sees "Forty-Two" without explanation:
- Worker unreachable
- Groq rate limited
- Stream interrupted (show partial text)

No error messages, toasts, or UI disruption.

## Out of Scope (YAGNI)

- User-facing error messages
- Retry logic
- Rate limit UI
- Settings/preferences for AI responses
- Response caching

## Deployment Steps

1. Create Cloudflare account (if needed)
2. `npm create cloudflare` to scaffold worker
3. Deploy worker with `wrangler deploy`
4. Set `GROQ_API_KEY` secret via wrangler
5. Update frontend with worker URL
6. Push to GitHub Pages

## Testing

- Manual testing with various questions
- Verify fallback by temporarily breaking API URL
- Test streaming behavior with slow network (DevTools throttling)
