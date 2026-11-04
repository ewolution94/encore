// The order a family setting is decided in (Dashboard, plans/dashboard.md in the workspace): this
// device's own choice, then Dashboard's default (the family's, or one set for Encore alone), then
// the built-in one, which is today's. public/boot.js does the same for the theme before first paint.
// No Svelte and no DOM here, so the tests load it as it is.

export type Theme = 'system' | 'light' | 'dark';
export type Locale = 'de' | 'en';

/** The theme to show: light or dark, or `system` to follow the device's own setting. */
export const themeFor = (own: Theme, dashboard: unknown): Theme =>
  own !== 'system' ? own : dashboard === 'light' || dashboard === 'dark' ? dashboard : 'system';

/** The language to show: this device's choice, else Dashboard's, else the browser's (`detected`). */
export const languageFor = (own: Locale | 'system', dashboard: unknown, detected: Locale): Locale =>
  own !== 'system' ? own : dashboard === 'de' || dashboard === 'en' ? dashboard : detected;
