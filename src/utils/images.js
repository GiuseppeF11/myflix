const IMG_BASE = 'https://image.tmdb.org/t/p';
const FALLBACK_POSTER = 'https://image.pngaaa.com/321/3555321-small.png';

// size: poster -> w185/w342/w500/w780 ; backdrop -> w780/w1280/original
export function getImageUrl(path, size = 'w500') {
  if (!path) return FALLBACK_POSTER;
  return `${IMG_BASE}/${size}${path}`;
}

export function getBackdropUrl(path, size = 'w1280') {
  if (!path) return FALLBACK_POSTER;
  return `${IMG_BASE}/${size}${path}`;
}
