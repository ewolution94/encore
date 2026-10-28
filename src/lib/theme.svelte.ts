// Mirrors public/boot.js, which applies the saved theme before first paint; keep them in step.
import { themeShift } from '../../vendor/ewo/elements/theme-shift.js';

export type ThemePreference = 'system' | 'light' | 'dark';

const KEY = 'encore:theme';
const PAGE = { light: '#ffffff', dark: '#0f0f12' };
const media = matchMedia('(prefers-color-scheme: dark)');

function load(): ThemePreference {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

class Theme {
  preference = $state<ThemePreference>(load());
  #systemDark = $state(media.matches);
  resolved = $derived<'light' | 'dark'>(this.preference === 'system' ? (this.#systemDark ? 'dark' : 'light') : this.preference);

  constructor() {
    media.addEventListener('change', (e) => (this.#systemDark = e.matches));
  }

  /** The control updates at once; the page follows under Folio's veil (themeShift), unless the
   *  pick changes nothing on screen (system → the system's own choice). */
  set(next: ThemePreference) {
    if (next === this.preference) return;
    const before = this.resolved;
    this.preference = next;
    if (this.resolved === before) this.#apply(next);
    else themeShift(() => this.#apply(next));
  }

  #apply(next: ThemePreference) {
    const root = document.documentElement;
    if (next === 'system') delete root.dataset.theme;
    else root.dataset.theme = next;
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {}
    // Folio's --ewo-bg is a light-dark() pair, which a custom property reads back unresolved, so
    // the page colours are written out here (as in boot.js). "system" gives each meta its own.
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      const own = meta.media.includes('dark') ? 'dark' : 'light';
      meta.content = PAGE[next === 'system' ? own : next];
    }
  }
}

export const theme = new Theme();
