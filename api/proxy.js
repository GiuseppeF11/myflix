export default async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY non configurata' });
    return;
  }

  const { path, ...rest } = req.query;
  if (!path) {
    res.status(400).json({ error: 'path parameter required' });
    return;
  }

  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(rest)) {
    url.searchParams.set(k, v);
  }

  try {
    const upstream = await fetch(url.toString());
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'upstream fetch failed' });
  }
}
