import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseTracklist } from '../shared/tracklist.mjs';

// The 1001Tracklists bookmarklet as it ships, without a page around it: run without a document,
// it hands back its own functions. The page is a real one (tests/fixtures/1001tracklists.html).
const source = readFileSync(new URL('../bookmarklet/from-1001tracklists.js', import.meta.url), 'utf8');
const PAGE = readFileSync(new URL('./fixtures/1001tracklists.html', import.meta.url), 'utf8');
const { readRows, tracksOf, format } = vm.runInNewContext(source, { globalThis: {} });
const plain = (value) => JSON.parse(JSON.stringify(value));

test('the rows of a real tracklist page: tracks, “w/” layers and a mashup’s parts, with times', () => {
  const rows = plain(readRows(PAGE));
  assert.equal(rows.length, 14);
  assert.deepEqual(rows.slice(0, 5), [
    { kind: 'track', start: 0, name: 'Skrillex - My Name Is Skrillex (Porter Robinson Edit)' },
    { kind: 'track', start: 70, name: 'Mat Zo & Porter Robinson - Easy (Nurture Live Edit)' },
    { kind: 'with', start: 0, name: 'Daft Punk - One More Time' },
    { kind: 'with', start: 0, name: 'Porter Robinson - Flicker' },
    { kind: 'track', start: 165, name: 'Bart B More & Harvard Bass - Pari (Porter Robinson Edit)' },
  ]);
  assert.deepEqual(
    rows.filter((r) => r.kind === 'part').map((r) => r.name),
    ['Bastille - Pompeii (Audien Instrumental)', 'Porter Robinson - Is There Really No Happiness?'],
  );
  assert.deepEqual(rows.find((r) => r.name.startsWith('Ayla')), { kind: 'with', start: 1680, name: 'Ayla - Ayla (Taucher Remix / Porter Robinson Edit)' });
});

test('as Encore’s lines: one per timed track, layers after “w/”, and Encore reads them back', () => {
  const { tracks, untimed } = tracksOf(readRows(PAGE));
  assert.equal(untimed.length, 0);
  const text = format(tracks);
  assert.deepEqual(text.split('\n'), [
    '0:00 Skrillex - My Name Is Skrillex (Porter Robinson Edit)',
    '1:10 Mat Zo & Porter Robinson - Easy (Nurture Live Edit) w/ Daft Punk - One More Time w/ Porter Robinson - Flicker',
    '2:45 Bart B More & Harvard Bass - Pari (Porter Robinson Edit) w/ LE SSERAFIM - Crazy',
    '3:30 Bastille & Audien vs. Porter Robinson - Pompeii vs. Is There Really No Happiness? (Porter Robinson Mashup)',
    '6:15 Plump DJs - Gobbstopper (Porter Robinson Edit)',
    '25:14 BLACKPINK - JUMP',
    '26:10 Virtual Self - Ghost Voices (Mar Vista Dub) w/ Ayla - Ayla (Taucher Remix / Porter Robinson Edit)',
    '28:55 Skrillex & Young Miko - Duro',
  ]);
  const parsed = parseTracklist(text);
  assert.equal(parsed.length, 8);
  assert.deepEqual(parsed[1], {
    start: 70,
    artist: 'Mat Zo & Porter Robinson',
    title: 'Easy (Nurture Live Edit) w/ Daft Punk - One More Time w/ Porter Robinson - Flicker',
  });
  assert.deepEqual(parsed[3], { start: 210, artist: 'Bastille & Audien vs. Porter Robinson', title: 'Pompeii vs. Is There Really No Happiness? (Porter Robinson Mashup)' });

  assert.equal(format(tracks, { layers: false }).split('\n')[1], '1:10 Mat Zo & Porter Robinson - Easy (Nurture Live Edit)', 'the switch leaves the layers out');
});

test('a set past an hour gets hours on every line; a track without a time is left out and named', () => {
  const late = PAGE.replace(/(_cue_seconds" type="hidden" value=")1735"/, '$13725"');
  assert.ok(late !== PAGE);
  const lines = format(tracksOf(readRows(late)).tracks).split('\n');
  assert.equal(lines[0], '0:00:00 Skrillex - My Name Is Skrillex (Porter Robinson Edit)');
  assert.equal(lines.at(-1), '1:02:05 Skrillex & Young Miko - Duro');

  // Plump DJs without a time, as 1001Tracklists leaves it (0 past the first track, or nothing).
  for (const value of ['0', '']) {
    const gap = PAGE.replace(/(_cue_seconds" type="hidden" value=")375"/, `$1${value}"`);
    assert.ok(gap !== PAGE);
    const { tracks, untimed } = plain(tracksOf(readRows(gap)));
    assert.deepEqual(untimed.map((t) => t.name), ['Plump DJs - Gobbstopper (Porter Robinson Edit)']);
    assert.equal(tracks.length, 7);
  }
});

test('the page as a browser serialises it reads the same', () => {
  // Quoted attributes where 1001Tracklists sends them bare, as `outerHTML` gives them.
  const browser = PAGE.replace(/ form=frmEditTracklist/g, ' form="frmEditTracklist"');
  assert.ok(browser !== PAGE);
  assert.deepEqual(plain(readRows(browser)), plain(readRows(PAGE)));
  assert.deepEqual(plain(readRows('<html><body>No tracklist</body></html>')), []);
});
