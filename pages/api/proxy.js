export default async function handler(req, res) {
  const base  = process.env.GAS_URL;
  const token = process.env.API_TOKEN;

  if (!base || !token) {
    return res.status(500).json({ error: 'Missing GAS_URL or API_TOKEN' });
  }

  const inUrl = new URL(req.url, `http://${req.headers.host}`);
  const out   = new URL(base);

  const allow = ['limit','since','until','ytd','mode'];
  for (const k of allow) {
    if (inUrl.searchParams.has(k)) {
      out.searchParams.set(k, inUrl.searchParams.get(k));
    }
  }
  out.searchParams.set('token', token);

  try {
    const r = await fetch(out.toString(), { headers: { 'User-Agent': 'vercel-proxy/1.0' }});
    const body = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(r.status).send(body);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
