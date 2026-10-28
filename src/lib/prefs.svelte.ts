// This device's preferences (the theme lives in theme.svelte.ts, which boot.js mirrors before first
// paint), and what's open right now.

export type Language = 'system' | 'en' | 'de';

interface Prefs {
  language: Language;
}

const KEY = 'encore:prefs';
const DEFAULTS: Prefs = { language: 'system' };

function load(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export const prefs = $state<Prefs>(load());

/** What's open: the settings sheet. */
export const ui = $state({ settings: false });

$effect.root(() => {
  $effect(() => {
    const snapshot = JSON.stringify(prefs);
    try {
      localStorage.setItem(KEY, snapshot);
    } catch {}
  });
});
