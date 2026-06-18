/**
 * Ritorna una versione "debounced" di fn: la chiamata effettiva avviene solo
 * dopo che sono passati `wait` ms dall'ultima invocazione. Utile per non
 * scatenare una richiesta ad ogni carattere digitato.
 */
export function debounce(fn, wait = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
