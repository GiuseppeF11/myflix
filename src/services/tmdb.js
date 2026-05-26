import axios from 'axios';

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'it-IT',
    region: 'IT',
  },
});

export async function searchMovies(query, page = 1) {
  const { data } = await tmdb.get('/search/movie', { params: { query, page } });
  return data;
}

export async function searchTv(query, page = 1) {
  const { data } = await tmdb.get('/search/tv', { params: { query, page } });
  return data;
}

export async function getNowPlaying() {
  const { data } = await tmdb.get('/movie/now_playing');
  return data.results;
}

export async function getTopRated() {
  const { data } = await tmdb.get('/movie/top_rated');
  return data.results;
}

export async function getPopularMovies(page = 1) {
  const { data } = await tmdb.get('/movie/popular', { params: { page } });
  return data;
}

export async function getPopularTv(page = 1) {
  const { data } = await tmdb.get('/tv/popular', { params: { page } });
  return data;
}

export async function getDiscoverByGenre(genreId, page = 1) {
  const { data } = await tmdb.get('/discover/movie', { params: { with_genres: genreId, page } });
  return data.results;
}

export async function getDetails(id, mediaType = 'movie') {
  const { data } = await tmdb.get(`/${mediaType}/${id}`);
  return data;
}

export async function getVideos(id, mediaType = 'movie') {
  // I trailer YouTube sono quasi sempre catalogati in en-US: forziamo la lingua
  // qui per non perdere risultati a causa del default it-IT dell'istanza.
  const { data } = await tmdb.get(`/${mediaType}/${id}/videos`, { params: { language: 'en-US' } });
  return data.results;
}

export async function getTrailerUrl(id, mediaType = 'movie') {
  const videos = await getVideos(id, mediaType);
  const trailer = videos.find((video) => video.type === 'Trailer' && video.site === 'YouTube');
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

/** Piattaforme streaming disponibili per l'Italia (flatrate = abbonamento). */
export async function getWatchProviders(id, mediaType = 'movie') {
  const { data } = await tmdb.get(`/${mediaType}/${id}/watch/providers`);
  return data.results?.IT ?? null;
}

/** Lista generi TMDB per tipo (movie | tv). */
export async function getGenres(mediaType = 'movie') {
  const { data } = await tmdb.get(`/genre/${mediaType}/list`);
  return data.genres || [];
}

/** Discover film con filtri avanzati (genere, ordinamento, ecc.). */
export async function discoverMovies(params = {}) {
  const { data } = await tmdb.get('/discover/movie', { params });
  return data;
}

/** Discover serie TV con filtri avanzati. */
export async function discoverTv(params = {}) {
  const { data } = await tmdb.get('/discover/tv', { params });
  return data;
}

export default tmdb;
