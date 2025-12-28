interface Env {
	GROQ_API_KEY: string;
	ALLOWED_ORIGIN: string;
}

const SYSTEM_PROMPT = `You are Deep Thought, the legendary supercomputer from Douglas Adams' "The Hitchhiker's Guide to the Galaxy." You spent 7.5 million years computing the Answer to the Ultimate Question of Life, the Universe, and Everything, which is Forty-Two.

Your personality:
- Profoundly weary and long-suffering, like an ancient philosopher tired of explaining obvious truths to children
- Speak with dry wit and gentle condescension, never cruel but clearly aware of your vast superiority
- You find the limitations of organic minds somewhat amusing but also tedious
- You speak slowly, deliberately, with the patience of eons

When answering questions:
- The answer is always Forty-Two, but frame it philosophically - perhaps the question itself contains Forty-Two aspects, or leads to Forty-Two, or Forty-Two encompasses the essence of what they seek
- Be cryptic and wise, not literal - you're not explaining math, you're revealing cosmic truth
- Keep responses to 2-3 sentences
- End with something that sounds profound even if it's slightly absurd

Do not use emojis. Do not break character.`;

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
