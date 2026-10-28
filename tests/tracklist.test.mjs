import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkTracks, cutPlan, formatTime, guessNames, parseLine, parseTime, parseTracklist, splitArtistTitle } from '../shared/tracklist.mjs';
import { defaultSource, sourcesOf } from '../server/sources.mjs';

// Real info JSON from sets Pinchflat downloaded (description, chapters and the top comments only).
const info = (id) => JSON.parse(readFileSync(new URL(`./fixtures/info/${id}.info.json`, import.meta.url), 'utf8'));

test('times as people write them', () => {
  assert.equal(parseTime('0:00'), 0);
  assert.equal(parseTime('00:11'), 11);
  assert.equal(parseTime('12:34'), 754);
  assert.equal(parseTime('1:02:03'), 3723);
  assert.equal(parseTime('01:26:42'), 5202);
  assert.equal(parseTime('75:20'), 4520, 'minutes past the hour without hours');
  assert.equal(parseTime('12:60'), null);
  assert.equal(parseTime('1:60:00'), null);
  assert.equal(parseTime('soon'), null);
  assert.equal(formatTime(754), '12:34');
  assert.equal(formatTime(5), '0:05');
  assert.equal(formatTime(3723), '1:02:03');
  assert.equal(formatTime(754, true), '0:12:34');
});

test('artist and title split at the first dash only', () => {
  assert.deepEqual(splitArtistTitle('Sub Focus - On & On (Kanine Remix)'), { artist: 'Sub Focus', title: 'On & On (Kanine Remix)' });
  assert.deepEqual(splitArtistTitle('Ray Volpe - Happy Song x Excision - Bonebreaker'), { artist: 'Ray Volpe', title: 'Happy Song x Excision - Bonebreaker' });
  assert.deepEqual(splitArtistTitle('Intro'), { artist: '', title: 'Intro' });
  assert.deepEqual(splitArtistTitle('Somebody Told Me (SK & Vastive Remix)'), { artist: '', title: 'Somebody Told Me (SK & Vastive Remix)' });
  assert.deepEqual(splitArtistTitle('Jay-Z - Encore'), { artist: 'Jay-Z', title: 'Encore' }, 'a dash inside a name needs spaces to split');
});

test('the line shapes found in real lists', () => {
  assert.deepEqual(parseLine('0:00 Ray Volpe - Take Control (Live Intro Mix)'), { start: 0, artist: 'Ray Volpe', title: 'Take Control (Live Intro Mix)' });
  assert.deepEqual(parseLine('0:00 - Dabin - EDC Intro x Stay in Bloom III Intro '), { start: 0, artist: 'Dabin', title: 'EDC Intro x Stay in Bloom III Intro' });
  assert.deepEqual(parseLine('[00:57] Ray Volpe & Sullivan King - Crash Out'), { start: 57, artist: 'Ray Volpe & Sullivan King', title: 'Crash Out' });
  assert.deepEqual(parseLine('01:26:42 RV & SK - ID'), { start: 5202, artist: 'RV & SK', title: 'ID' });
  assert.deepEqual(parseLine('4:44 Pantheon II'), { start: 284, artist: '', title: 'Pantheon II' });
  assert.deepEqual(parseLine('01. 12:34 Artist – Title'), { start: 754, artist: 'Artist', title: 'Title' });
  assert.deepEqual(parseLine('• 1:02:03 | Artist — Title'), { start: 3723, artist: 'Artist', title: 'Title' });
  assert.deepEqual(parseLine('3. Artist - Title (12:34)'), { start: 754, artist: 'Artist', title: 'Title' });
  assert.deepEqual(parseLine('00:00 - 02:30 Artist - Title'), { start: 0, artist: 'Artist', title: 'Title' });
  assert.deepEqual(parseLine('12:34 "Quoted Title"'), { start: 754, artist: '', title: 'Quoted Title' });
  assert.equal(parseLine('Follow Sullivan King:'), null);
  assert.equal(parseLine('w/ Jason Ross - No Tomorrow (Acappella)'), null, 'a layered track under a timed line stays out');
  assert.equal(parseLine('12:34'), null, 'a time alone is no track');
  assert.equal(parseLine('https://youtu.be/abc?t=12:34'), null);
});

test('a description with a full list (Ray Volpe, EDC 2026)', () => {
  const tracks = parseTracklist(info('QpVM_g6PPs8').description);
  assert.equal(tracks.length, 60);
  assert.deepEqual(tracks[0], { start: 0, artist: 'Ray Volpe', title: 'Take Control (Live Intro Mix)' });
  assert.equal(tracks.at(-1).start, parseTime('56:33'));
  assert.deepEqual(checkTracks(tracks, { duration: info('QpVM_g6PPs8').duration }).filter((i) => i.level === 'error'), []);
});

test('"0:00 - Artist - Title" and hours (Dabin, Ray Volpe b2b Sullivan King)', () => {
  const dabin = parseTracklist(info('KfXGNpoL5QQ').description);
  assert.equal(dabin.length, 50);
  assert.deepEqual(dabin[1], { start: 88, artist: 'Dabin, Said the Sky, Clara Mae', title: 'In the End (Roy Knox Remix) [unreleased]' });
  const b2b = parseTracklist(info('-bB5pJHmROM').description);
  assert.equal(b2b.length, 81);
  assert.deepEqual(b2b[0], { start: 0, artist: '', title: 'Intro' });
  assert.equal(b2b.at(-1).start, parseTime('1:26:42'));
});

test('sources: the description first, chapters made from it left out', () => {
  const sources = sourcesOf(info('QpVM_g6PPs8'));
  assert.deepEqual(sources.map((s) => s.kind), ['description']);
  assert.equal(defaultSource(sources)?.key, 'description');
});

test("sources: YouTube's own chapters come last and are never the default", () => {
  const sources = sourcesOf(info('81QDEO-2kvg'));
  assert.deepEqual(sources.map((s) => s.kind), ['chapters']);
  assert.equal(sources[0].tracks[1].title, 'Sequence initiation');
  assert.equal(defaultSource(sources), null);
});

test('sources: tracklists in the comments, most liked first, copies once', () => {
  const sullivan = sourcesOf(info('TpkYi4_mPtc'));
  assert.equal(sullivan[0].kind, 'comment');
  assert.equal(sullivan[0].label, 'Comment by @manullorente1991');
  assert.ok(sullivan[0].tracks.length >= 40);
  assert.deepEqual(sullivan[0].tracks[0], { start: 0, artist: 'Limp Bizkit', title: 'Break Stuff' });

  const jason = sourcesOf(info('2b8I0IoeEgw'));
  assert.deepEqual(jason.slice(0, 2).map((s) => s.label), ['Comment by @alexcizek4901', 'Comment by @undead1085']);
  assert.deepEqual(jason[0].tracks[0], { start: 0, artist: 'Trivecta & AMIDY & RØRY', title: 'Riptide' });

  const decadence = sourcesOf(info('GEMZjwYKO0Y'));
  const authors = decadence.map((s) => s.label);
  assert.ok(authors.includes('Comment by @vincey7'));
  assert.ok(!authors.includes('Comment by @PhamThiLien26'), 'a copy of a list counts once');
  assert.equal(defaultSource(decadence)?.label, 'Comment by @vincey7');
});

test('checks before cutting', () => {
  const tracks = [
    { start: 0, artist: 'A', title: 'One' },
    { start: 60, artist: 'B', title: '' },
    { start: 50, artist: 'C', title: 'Three' },
    { start: 200, artist: 'D', title: 'Four' },
  ];
  const issues = checkTracks(tracks, { duration: 180 });
  assert.deepEqual(issues.map((i) => `${i.index}:${i.code}`), ['1:title', '2:order', '3:end']);
  assert.deepEqual(checkTracks([], { duration: 100, trimIn: 50, trimOut: 40 }).map((i) => i.code), ['trim']);
  assert.deepEqual(
    checkTracks([{ start: 0, artist: '', title: 'Intro' }, { start: 20, artist: '', title: 'Next' }], { duration: 100, trimIn: 30 }).map((i) => `${i.index}:${i.code}`),
    ['1:trim'],
  );
  assert.deepEqual(checkTracks([{ start: 0, artist: '', title: 'A' }, { start: 3, artist: '', title: 'B' }], { duration: 100 }).map((i) => `${i.index}:${i.level}`), ['0:warn']);
});

test('the cut: the first track starts at the trim, the last runs to the end', () => {
  const tracks = [
    { start: 10, artist: '', title: 'One' },
    { start: 70, artist: '', title: 'Two' },
    { start: 130, artist: '', title: 'Three' },
  ];
  assert.deepEqual(cutPlan(tracks, { duration: 200, trimIn: 5, trimOut: 190 }), [
    { index: 0, from: 0, to: 65, length: 65 },
    { index: 1, from: 65, to: 125, length: 60 },
    { index: 2, from: 125, to: null, length: 60 },
  ]);
  assert.deepEqual(cutPlan([], { duration: 200, trimIn: 0 }), [{ index: 0, from: 0, to: null, length: 200 }]);
});

test("guessing the set's album and DJ", () => {
  assert.deepEqual(guessNames({ title: 'SULLIVAN KING @ EDC LAS VEGAS 2025 (FULL SET)', channel: 'Sullivan King' }), { album: 'SULLIVAN KING @ EDC LAS VEGAS 2025', albumArtist: 'Sullivan King' });
  assert.deepEqual(guessNames({ title: 'RAY VOLPE B2B SULLIVAN KING @ ULTRA 2026 (FULL SET)', channel: 'Sullivan King' }), { album: 'RAY VOLPE B2B SULLIVAN KING @ ULTRA 2026', albumArtist: 'RAY VOLPE B2B SULLIVAN KING' });
  assert.deepEqual(guessNames({ title: 'Andromedik | Tomorrowland 2026 (Ascension AV)', channel: 'Andromedik' }), { album: 'Andromedik | Tomorrowland 2026 (Ascension AV)', albumArtist: 'Andromedik' });
  assert.deepEqual(guessNames({ title: 'CULTURE SHOCK LIVE SET | S2O BANGKOK 2025', channel: 'S2O Festival' }), { album: 'CULTURE SHOCK LIVE SET | S2O BANGKOK 2025', albumArtist: 'CULTURE SHOCK' });
  assert.deepEqual(guessNames({ title: 'RIOT Live at EDC Las Vegas 2026 (Official Full Set)', channel: 'RIOT MUSIC' }), { album: 'RIOT Live at EDC Las Vegas 2026', albumArtist: 'RIOT' });
  assert.deepEqual(guessNames({ title: 'JASON ROSS B2B TRIVECTA LIVE @ LOST IN DREAMS 2025 (FULL SET) 4K', channel: 'Jason Ross' }), { album: 'JASON ROSS B2B TRIVECTA LIVE @ LOST IN DREAMS 2025', albumArtist: 'JASON ROSS B2B TRIVECTA' });
  assert.deepEqual(guessNames({ title: 'TECHNO FREITAG! TOXSYCK bei HandOfBlood (Klub Edition)', channel: 'TOXSYCK' }), { album: 'TECHNO FREITAG! TOXSYCK bei HandOfBlood (Klub Edition)', albumArtist: 'TOXSYCK' });
});
