// api/proxy.js
// Minimal passthrough proxy that ALWAYS appends your secret token server-side.
// Uses single quotes as requested.

export default async function handler(req, res) {
  try {
    const base = process.env.UPSTREAM_BASE;      // Apps Script exec URL (no query)
    const token = process.env.UPSTREAM_TOKEN;    // your secret

    if (!base || !token) {
      return res.status(500).json({
        ok: false,
        error: 'Missing UPSTREAM_BASE or UPSTREAM_TOKEN env var',
      });
    }

    // Only allow these query params from the client
    const allow = ['limit', 'since', 'until', 'ytd', 'mode', 'token'];

    // Build upstream URL
    const url = new URL(base);
    // Forward only allowed params
    for (const [k, v] of Object.entries(req.query || {})) {
      if (allow.includes(k)) url.searchParams.set(k, String(v));
    }
    // Always append token
    url.searchParams.set('token', token);

    // If no mode provided, ask for a small health to avoid placeholders downstream
    if (!url.searchParams.has('mode')) {
      url.searchParams.set('mode', 'health');
    }

    const upstream = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const text = await upstream.text();

    // Try to return JSON if possible, otherwise passthrough text
    try {
      const json = JSON.parse(text);
      return res.status(upstream.status).json(json);
    } catch {
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/plain');
      return res.status(upstream.status).send(text);
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
