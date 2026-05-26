/**
 * Ritorna true solo se l'item ha i campi strutturali minimi per essere
 * visualizzato (titolo + locandina + data). Overview e vote_average non
 * vengono controllati qui perché TMDB spesso restituisce stringa vuota per
 * lingue diverse dall'inglese, e i titoli recenti non hanno ancora voti.
 */
export function hasRequiredData(item) {
  if (!item) return false;
  const title = item.title || item.name;
  const date  = item.release_date || item.first_air_date;
  return !!title && !!item.poster_path && !!date;
}
