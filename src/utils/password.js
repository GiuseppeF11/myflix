/**
 * Regole di validazione password per Cinova.
 * Ogni regola ha: id, label leggibile, funzione test(password) → boolean.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Almeno 8 caratteri',
    test: (p) => p.length >= 8,
  },
  {
    id: 'upper',
    label: 'Almeno una lettera maiuscola',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lower',
    label: 'Almeno una lettera minuscola',
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: 'numbers',
    label: 'Almeno 2 numeri',
    test: (p) => (p.match(/\d/g) || []).length >= 2,
  },
  {
    id: 'special',
    label: 'Almeno un carattere speciale (es. @, #, !)',
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

/** Ritorna true solo se TUTTE le regole sono soddisfatte. */
export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/** Ritorna il numero di regole soddisfatte (0–5). */
export function passwordStrength(password) {
  return PASSWORD_RULES.filter((rule) => rule.test(password)).length;
}

/** Ritorna le regole arricchite con il flag `passed`. */
export function evaluateRules(password) {
  return PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) }));
}

/**
 * Verifica che l'indirizzo email abbia un formato sintatticamente valido.
 * Non garantisce l'esistenza della casella, ma blocca input palesemente errati.
 */
export function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || '').trim());
}
