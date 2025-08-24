export default async function handler(req, res) {
  const base  = process.env.GAS_URL;   // Your Google Apps Script /exec URL (no query params)
  const token = process.env.API_TOKEN; // Your secret token string

  if (!base || !token) {
    return res.status(500).json({ error: 'Missing GAS_URL or API_TOKEN' });
  }

  // Build the outbound URL to GAS by passing through approved query params
  const inUrl = new URL(req.url, `http://${req.headers.host}`);
  const out   = new URL(base);

  const allow = ['limit', 'since', 'until', 'ytd'];
  for (const k of allow) {
    if (inUrl.searchParams.has(k)) {
      out.searchParams.set(k, inUrl.searchParams.get(k));
    }
  }
  // Inject your token server-side (kept out of client URL)
  out.searchParams.set('token', token);

  try {
    const r = await fetch(out.toString(), { headers: { 'User-Agent': 'vercel-proxy/1.0' } });
    const body = await r.text();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(r.status).send(body);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
