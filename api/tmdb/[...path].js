/**
 * Proxy serverless Vercel per TMDB.
 * La api_key rimane server-side (env var) e non è mai esposta nel bundle client.
 * Route: /api/tmdb/* → https://api.themoviedb.org/3/*
 */
export default async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY non configurata' });
    return;
  }

  // req.query.path è un array dei segmenti di path (catch-all [...path])
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const tmdbPath = segments.filter(Boolean).join('/');

  const url = new URL(`https://api.themoviedb.org/3/${tmdbPath}`);
  url.searchParams.set('api_key', apiKey);

  // Inoltra tutti i query param ricevuti dal client (language, region, query, page…)
  const { path: _, ...rest } = req.query;
  for (const [k, v] of Object.entries(rest)) {
    url.searchParams.set(k, v);
  }

  const upstream = await fetch(url.toString());
  const data = await upstream.json();

  res.setHeader('Cache-Control', 'no-store');
  res.status(upstream.status).json(data);
}
