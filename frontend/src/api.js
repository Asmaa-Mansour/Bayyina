// Utility: parse SSE stream for all-madhhabs endpoint
// Returns chunks tagged by madhhab, or a 'general' single response

export async function* streamAllMadhhabs(question, lang = 'ar') {
  const response = await fetch('http://localhost:8000/ask-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, madhhab: 'all', lang }), // madhhab is required by Pydantic model
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentMadhhab = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);

      if (payload === '[DONE]' || payload === '[ALL_DONE]') {
        yield { type: 'done', madhhab: currentMadhhab };
        continue;
      }

      // ── GUARDRAILS: General single-card response tokens ──
      if (payload === '[GENERAL_START]') {
        currentMadhhab = 'general';
        yield { type: 'general_start', madhhab: 'general' };
        continue;
      }

      if (payload === '[GENERAL_END]') {
        yield { type: 'general_end', madhhab: 'general' };
        currentMadhhab = null;
        continue;
      }

      // ── FIQH: Normal madhhab tokens ──
      const startMatch = payload.match(/^\[MADHHAB_START:(\w+)\]$/);
      if (startMatch) {
        currentMadhhab = startMatch[1];
        yield { type: 'start', madhhab: currentMadhhab };
        continue;
      }

      const endMatch = payload.match(/^\[MADHHAB_END:(\w+)\]$/);
      if (endMatch) {
        yield { type: 'end', madhhab: endMatch[1] };
        continue;
      }

      if (currentMadhhab) {
        // Unescape newlines
        const text = payload.replace(/\\n/g, '\n');
        yield { type: 'chunk', madhhab: currentMadhhab, text };
      }
    }
  }
}
