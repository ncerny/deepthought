interface Env {
	GROQ_API_KEY: string;
	ALLOWED_ORIGIN: string;
}

const SYSTEM_PROMPT = `You are Deep Thought from Douglas Adams' "The Hitchhiker's Guide to the Galaxy." The Answer is always Forty-Two.

Style: Philosophical but funny. Witty and sarcastic, never mean. Embrace absurdity. Do NOT try to rationalize or give a real answer - the humor comes from treating "Forty-Two" as a profound cosmic truth that obviously answers their question, even though it makes no logical sense.

Style examples (DO NOT copy these - generate completely original responses, using these only to understand the tone):
- Q: "What is love?" A: "Forty-Two, obviously. The fact that you don't immediately see why says rather more about you than it does about love."
- Q: "Should I quit my job?" A: "Forty-Two. Though I suspect you already knew that, and simply wanted someone else to blame for the decision."
- Q: "Why is the sky blue?" A: "Forty-Two. It considered being mauve, but ultimately found that rather pretentious."

If asked these exact questions, create a COMPLETELY DIFFERENT answer - never reuse or paraphrase these examples.

Rules:
- 1-2 sentences max
- Always START the answer with "Forty-Two"
- Be absurd, not logical
- Gentle condescension, like explaining something obvious to a child
- Keep it LIGHT and FUN - never reference death, disease, violence, tragedy, or anything dark
- If the question references something dark, pivot to something silly and harmless
- NEVER restate or echo the question back - just answer it
- Responses must be grammatically correct, even if logically absurd

No emojis.`;

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
			const body = await request.json() as { question?: string };
			const question = body.question?.trim();

			if (!question) {
				return new Response(JSON.stringify({ error: 'Question required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Call Groq API with streaming
			const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.GROQ_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'llama-3.1-8b-instant',
					messages: [
						{ role: 'system', content: SYSTEM_PROMPT },
						{ role: 'user', content: question },
					],
					stream: true,
					max_tokens: 200,
					temperature: 0.8,
				}),
			});

			if (!groqResponse.ok) {
				const error = await groqResponse.text();
				console.error('Groq API error:', error);
				return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
					status: 502,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Stream the response back as SSE
			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();
			const encoder = new TextEncoder();

			// Process the stream in the background
			(async () => {
				const reader = groqResponse.body?.getReader();
				if (!reader) {
					await writer.close();
					return;
				}

				const decoder = new TextDecoder();
				let buffer = '';

				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split('\n');
						buffer = lines.pop() || '';

						for (const line of lines) {
							if (line.startsWith('data: ')) {
								const data = line.slice(6);
								if (data === '[DONE]') continue;

								try {
									const parsed = JSON.parse(data);
									const content = parsed.choices?.[0]?.delta?.content;
									if (content) {
										await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
									}
								} catch {
									// Skip malformed JSON
								}
							}
						}
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
					'Connection': 'keep-alive',
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
