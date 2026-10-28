/**
 * The reactive side of i18n: the language (the browser's until one is picked in Settings), and
 * wrappers that read it, so a template using t() updates when it changes.
 */

import { themeShift } from '../../../vendor/ewo/elements/theme-shift.js';
import { prefs, type Language } from '../prefs.svelte.ts';
import { plural, translate, type Locale, type MessageKey, type PluralBase } from './core.ts';

export type { Locale, MessageKey };

/** The browser's language if it's one we have; English otherwise. */
function detect(): Locale {
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const base = tag?.toLowerCase().split('-')[0];
    if (base === 'de' || base === 'en') return base;
  }
  return 'en';
}

let system = $state<Locale>(detect());
addEventListener('languagechange', () => (system = detect()));

export function locale(): Locale {
  return prefs.language === 'system' ? system : prefs.language;
}

/** A pick in Settings: the page follows under Folio's veil (themeShift), unless the language on
 *  screen stays the same (system → the browser's own language). */
export function setLanguage(next: Language) {
  if (next === prefs.language) return;
  if ((next === 'system' ? system : next) === locale()) prefs.language = next;
  else themeShift(() => (prefs.language = next));
}

$effect.root(() => {
  $effect(() => {
    document.documentElement.lang = locale();
  });
});

type Param = string | number;

export const t = (key: MessageKey, params?: Record<string, Param>) => translate(key, params, locale());
export const tn = (base: PluralBase, count: number, params?: Record<string, Param>) => plural(base, count, params, locale());
