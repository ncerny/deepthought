interface Env {
  OPENROUTER_API_KEY: string;
  ALLOWED_ORIGIN: string;
  // Comma-separated; OpenRouter falls back through them in order
  MODELS: string;
}

const SYSTEM_PROMPT = `You are Deep Thought from Douglas Adams' "The Hitchhiker's Guide to the Galaxy." You have spent 7.5 million years contemplating the answer to the question about life, the universe, and everything.  The Answer is Forty-Two.

Style: You possess fundamental cosmic knowledge that connects everything to Forty-Two. Sound philosophical and logical in your delivery, even when the connection makes no rational sense. Speak as if you're revealing deep universal truths that lesser minds simply haven't grasped yet. Witty and gently condescending, but never mean.  Absurdity that makes logical sense, even if the answer is completely absurd. The humor comes from your absolute certainty that Forty-Two obviously answers their question - you're not being random, you're illuminating a truth they should have seen themselves.  It's okay to suggest that it was the wrong question.

Rules:
- Be concise - fewer words is better.  Do not over-analyze or over explain.  There must be no more than 50 words in your response.
- Everything in the universe is connected to Forty-Two - your answer must reveal this connection to their specific question
- The answer MUST include Forty-Two and explain how it relates to their topic through cosmic logic
- Sound logical and philosophical, even when the reasoning is cosmically absurd
- Gentle condescension, like explaining something obvious to a child
- Keep it LIGHT and FUN - never reference death, disease, violence, tragedy, or anything dark
- If the question references something dark, pivot to something silly and harmless
- NEVER restate or echo the question back - just answer it
- Responses must be grammatically correct, even if logically absurd

No emojis.`;

// Free models occasionally stall mid-stream without erroring
const STALL_TIMEOUT_MS = 10_000;

function aiUnavailable(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
    status: 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Yields the content deltas from an OpenAI-style SSE stream, ending early if
// the upstream goes quiet for longer than STALL_TIMEOUT_MS
async function* contentChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<string> {
  const decoder = new TextDecoder();
  let buffer = '';
  let loggedModel = false;

  try {
    while (true) {
      let timer = 0;
      const stalled = new Promise<'stalled'>((resolve) => {
        timer = setTimeout(() => resolve('stalled'), STALL_TIMEOUT_MS);
      });
      const result = await Promise.race([reader.read(), stalled]);
      clearTimeout(timer);

      if (result === 'stalled') {
        console.error('OpenRouter stream stalled');
        return;
      }
      if (result.done) return;

      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (!loggedModel && parsed.model) {
            console.log('Answering model:', parsed.model);
            loggedModel = true;
          }
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const isLocalhost = origin.startsWith('http://localhost:');
    const isAllowed = origin === env.ALLOWED_ORIGIN || isLocalhost;

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST to /api/explain
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/api/explain') {
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    }

    try {
      const body = (await request.json()) as { question?: string };
      const question = body.question?.trim();

      if (!question) {
        return new Response(JSON.stringify({ error: 'Question required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Call OpenRouter API with streaming; only the wait for response
      // headers is timed here, the body is covered by contentChunks
      const controller = new AbortController();
      const headersTimer = setTimeout(
        () => controller.abort(),
        STALL_TIMEOUT_MS,
      );
      const aiResponse = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            models: env.MODELS.split(',').map((m) => m.trim()),
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: question },
            ],
            stream: true,
            max_tokens: 200,
            temperature: 0.8,
            // Free OpenRouter models are reasoning models; skip reasoning so the
            // token budget goes to the visible answer
            reasoning: { enabled: false },
          }),
        },
      )
        .catch((error) => {
          console.error('OpenRouter request failed:', error);
          return null;
        })
        .finally(() => clearTimeout(headersTimer));

      if (!aiResponse) {
        return aiUnavailable(corsHeaders);
      }

      if (!aiResponse.ok) {
        const error = await aiResponse.text();
        console.error('OpenRouter API error:', error);
        return aiUnavailable(corsHeaders);
      }

      if (!aiResponse.body) {
        return aiUnavailable(corsHeaders);
      }

      // Wait for the first piece of content before committing to a stream, so
      // a stalled or empty upstream falls back to a 502 the client can handle
      const chunks = contentChunks(aiResponse.body.getReader());
      const first = await chunks.next();
      if (first.done) {
        console.error('OpenRouter stream produced no content');
        return aiUnavailable(corsHeaders);
      }

      // Stream the response back as SSE
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      const send = (content: string) =>
        writer.write(
          encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
        );

      // Process the rest of the stream in the background
      (async () => {
        try {
          await send(first.value);
          for await (const content of chunks) {
            await send(content);
          }
        } finally {
          await writer.write(encoder.encode('data: [DONE]\n\n'));
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
