// Utility: parse SSE stream for all-madhhabs endpoint
// Returns chunks tagged by madhhab, or a 'general' single response

// Backend URL: set VITE_API_URL at build time (Render static site env var).
// Falls back to localhost for local development.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

// ── User-supplied Gemini API key (stored in this browser only) ──
const KEY_STORAGE = 'bayyina-gemini-key';

export const getApiKey = () => {
  try { return localStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
};
export const setApiKey = (k) => { try { localStorage.setItem(KEY_STORAGE, k.trim()); } catch { /* ignore */ } };
export const clearApiKey = () => { try { localStorage.removeItem(KEY_STORAGE); } catch { /* ignore */ } };

const authHeaders = (key = getApiKey()) => (key ? { 'X-Gemini-Key': key } : {});

export async function validateApiKey(key) {
  const res = await fetch(`${API_URL}/validate-key`, {
    method: 'POST',
    headers: authHeaders(key),
  });
  if (!res.ok) throw new Error('invalid');
  return true;
}

export async function* streamAllMadhhabs(question, lang = 'ar') {
  const response = await fetch(`${API_URL}/ask-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ question, madhhab: 'all', lang }), // madhhab is required by Pydantic model
  });

  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
    err.status = response.status;
    throw err;
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
