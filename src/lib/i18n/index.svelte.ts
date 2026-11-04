/**
 * The reactive side of i18n: the language (the one picked in Settings, else Dashboard's default,
 * else the browser's), and wrappers that read it, so a template using t() updates when it changes.
 */

import { readConfig } from '../../../vendor/ewo/elements/config-client.js';
import { themeShift } from '../../../vendor/ewo/elements/theme-shift.js';
import { languageFor } from '../defaults.ts';
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

/** The language a pick asks for: its own, or for Default Dashboard's, else the browser's. */
const wanted = (pick: Language): Locale => languageFor(pick, readConfig().lang, system);

export function locale(): Locale {
  return wanted(prefs.language);
}

/** A pick in Settings: the page follows under Folio's veil (themeShift), unless the language on
 *  screen stays the same (Default → what Default already shows). */
export function setLanguage(next: Language) {
  if (next === prefs.language) return;
  if (wanted(next) === locale()) prefs.language = next;
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
