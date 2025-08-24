export const config = { runtime: 'edge' };

export default async function handler(req) {
  const base  = process.env.GAS_URL;   // Apps Script /exec (no query)
  const token = process.env.API_TOKEN; // your secret

  if (!base || !token) {
    return new Response(JSON.stringify({ error: 'Missing GAS_URL or API_TOKEN' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const inUrl = new URL(req.url);
  const out   = new URL(base);

  const allow = ['limit','since','until','ytd'];
  for (const k of allow) {
    if (inUrl.searchParams.has(k)) out.searchParams.set(k, inUrl.searchParams.get(k));
  }
  out.searchParams.set('token', token);

  const r = await fetch(out.toString(), { headers: { 'User-Agent': 'vercel-proxy/1.0' }});
  const body = await r.text();

  return new Response(body, {
    status: r.status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*'
    },
  });
}
