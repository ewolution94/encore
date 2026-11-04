import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
// What Encore hands Dashboard (public/ewo.config.json), checked with Folio's own rules, and the
// order a setting is decided in: this device's own choice, then Dashboard's default, then the
// built-in one (src/lib/defaults.ts, and public/boot.js before first paint).
import { checkManifest, resolve } from '../vendor/ewo/elements/config-core.js';
import { languageFor, themeFor } from '../src/lib/defaults.ts';

const manifest = JSON.parse(readFileSync(new URL('../public/ewo.config.json', import.meta.url), 'utf8'));

test('the manifest is one Dashboard takes: the family’s language and theme', () => {
  const { ok, problems, manifest: checked } = checkManifest(manifest);
  assert.deepEqual(problems, []);
  assert.ok(ok);
  assert.equal(checked.app, 'encore');
  assert.deepEqual(Object.keys(checked.settings), ['lang', 'theme']);
});

test('with nothing set in Dashboard, both follow the device: the page as it ships', () => {
  const { values, sources } = resolve(manifest, {});
  assert.deepEqual(values, { lang: 'system', theme: 'system' });
  assert.deepEqual(sources, { lang: 'built-in', theme: 'built-in' });
  assert.equal(themeFor('system', values.theme), 'system');
  assert.equal(languageFor('system', values.lang, 'de'), 'de');
  assert.equal(languageFor('system', values.lang, 'en'), 'en');
});

test('Dashboard’s family default and this app’s own value reach the page', () => {
  assert.deepEqual(resolve(manifest, { family: { theme: 'dark', lang: 'en' } }).values, { lang: 'en', theme: 'dark' });
  assert.deepEqual(resolve(manifest, { family: { theme: 'dark', lang: 'de' }, app: { theme: 'light' } }).values, { lang: 'de', theme: 'light' });
  // A value that isn't one of the options falls back to the built-in one.
  assert.deepEqual(resolve(manifest, { family: { theme: 'purple' } }).values, { lang: 'system', theme: 'system' });
});

test('the device’s own choice beats Dashboard’s default, which beats the built-in one', () => {
  assert.equal(themeFor('light', 'dark'), 'light');
  assert.equal(themeFor('dark', 'light'), 'dark');
  assert.equal(themeFor('system', 'dark'), 'dark');
  assert.equal(themeFor('system', 'system'), 'system');
  assert.equal(themeFor('system', 'purple'), 'system');
  assert.equal(themeFor('system', undefined), 'system');
  // Encore keeps its language in encore:prefs, not ewo:lang; a pick there keeps winning.
  assert.equal(languageFor('en', 'de', 'de'), 'en');
  assert.equal(languageFor('de', 'en', 'en'), 'de');
  assert.equal(languageFor('system', 'en', 'de'), 'en');
  assert.equal(languageFor('system', 'system', 'de'), 'de');
  assert.equal(languageFor('system', undefined, 'en'), 'en');
});

/** public/boot.js against a stub page: the theme it applies before first paint. */
function boot({ saved, config, raw }) {
  const root = { dataset: {}, classList: { add() {}, remove() {} }, style: { setProperty() {} } };
  const metas = [{ content: '#ffffff', media: '(prefers-color-scheme: light)' }, { content: '#0f0f12', media: '(prefers-color-scheme: dark)' }];
  const block = raw ?? (config && JSON.stringify(config));
  const document = {
    documentElement: root,
    getElementById: (id) => (id === 'ewo-config' && block !== undefined ? { textContent: block } : null),
    querySelectorAll: () => metas,
    addEventListener() {},
  };
  const storage = { getItem: (key) => (key === 'encore:theme' && saved ? saved : null) };
  vm.runInNewContext(readFileSync(new URL('../public/boot.js', import.meta.url), 'utf8'), {
    document,
    localStorage: storage,
    matchMedia: () => ({ matches: false }),
    navigator: {},
    location: { search: '' },
    screen: {},
    addEventListener() {},
    setTimeout() {},
  });
  return { theme: root.dataset.theme, colors: metas.map((m) => m.content) };
}

test('before first paint: the saved theme, else Dashboard’s, else the system’s', () => {
  const asShipped = { theme: undefined, colors: ['#ffffff', '#0f0f12'] };
  assert.deepEqual(boot({}), asShipped);
  assert.deepEqual(boot({ raw: 'not json' }), asShipped);
  assert.deepEqual(boot({ config: { theme: 'system' } }), asShipped);
  assert.deepEqual(boot({ config: { theme: 'dark' } }), { theme: 'dark', colors: ['#0f0f12', '#0f0f12'] });
  assert.deepEqual(boot({ saved: 'light', config: { theme: 'dark' } }), { theme: 'light', colors: ['#ffffff', '#ffffff'] });
  assert.deepEqual(boot({ saved: 'dark' }), { theme: 'dark', colors: ['#0f0f12', '#0f0f12'] });
  assert.deepEqual(boot({ saved: 'bogus', config: { theme: 'light' } }), { theme: 'light', colors: ['#ffffff', '#ffffff'] });
});
