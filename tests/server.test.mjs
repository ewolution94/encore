import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { cleanDraft, createEncore } from '../server/encore.mjs';
import { cleanPart, trackFileName } from '../server/publish.mjs';
import { readyMessage } from '../server/telegram.mjs';

const FFMPEG = process.env.ENCORE_FFMPEG ?? 'ffmpeg';
const hasFfmpeg = (() => {
  try {
    execFileSync(FFMPEG, ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();
const quiet = { info() {}, warn() {}, error() {} };

test('file names Windows, Drive and Spotify all take', () => {
  assert.equal(cleanPart('AC/DC: "Live" <at> River Plate?', 60), 'AC DC Live at River Plate');
  assert.equal(cleanPart('Trailing dots...', 60), 'Trailing dots');
  assert.equal(cleanPart('a very long title that goes on and on', 20), 'a very long title');
  assert.equal(
    trackFileName({ id: 'QpVM_g6PPs8', album: 'RAY VOLPE @ EDC Las Vegas 2026', number: 7, total: 60, artist: 'Ray Volpe', title: 'Laserbeam VIP [u]' }),
    'RAY VOLPE @ EDC Las Vegas 2026 - 07 - Ray Volpe - Laserbeam VIP [u] [QpVM_g6PPs8].mp3',
  );
  assert.match(trackFileName({ id: 'x'.repeat(11), album: 'A', number: 3, total: 120, artist: 'B', title: 'C' }), / - 003 - /);
});

test('a draft from the page is cut down to what Encore stores', () => {
  const draft = cleanDraft(
    { album: 'X'.repeat(500), albumArtist: 'DJ', trimIn: -5, trimOut: 9999, tracks: [{ start: 12, artist: 1, title: 'T', extra: true }, { start: 'soon' }], source: 'pasted', evil: 1 },
    600,
  );
  assert.equal(draft.album.length, 200);
  assert.equal(draft.trimIn, 0);
  assert.equal(draft.trimOut, 600);
  assert.deepEqual(draft.tracks, [{ start: 12, artist: '1', title: 'T' }, { start: null, artist: '', title: '' }]);
  assert.equal('evil' in draft, false);
});

test('the Telegram line: one set, or one line for many', () => {
  const set = { id: 'QpVM_g6PPs8', title: 'RAY VOLPE @ EDC <2026>', channel: 'RAY VOLPE', duration: 3580, trackCount: 60, sourceLabel: 'Description' };
  assert.equal(
    readyMessage([set], 'https://encore.ewolution.cloud'),
    '🎧 <b>Ready to check</b>\n<a href="https://encore.ewolution.cloud/sets/QpVM_g6PPs8">RAY VOLPE @ EDC &lt;2026&gt;</a>\nRAY VOLPE · 60 min · 60 tracks from the description',
  );
  assert.match(readyMessage([{ ...set, sourceLabel: 'Comment by @vincey7' }], ''), /60 tracks from a comment by @vincey7$/);
  assert.match(readyMessage([{ ...set, trackCount: 0, sourceLabel: '' }], ''), /no tracklist found/);
  assert.equal(readyMessage([set, set, set, set], 'https://encore.ewolution.cloud'), '🎧 <b>4 sets ready to check</b>. <a href="https://encore.ewolution.cloud">Open Encore</a>');
});

test('scan, publish, publish again and remove, against a real ffmpeg', { skip: !hasFfmpeg && 'no ffmpeg' }, async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'encore-'));
  const staging = path.join(root, 'staging');
  const library = path.join(root, 'library');
  execFileSync('mkdir', ['-p', staging]);
  const id = 'AbCdEfGhIjK';
  // 45 s of a tone that steps every 15 s, as Pinchflat would leave it: Opus beside its info JSON.
  execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'aevalsrc=0.2*sin(2*PI*(220+110*floor(t/15))*t):s=48000:d=45', '-c:a', 'libopus', '-b:a', '64k', path.join(staging, `${id}.opus`)]);
  writeFileSync(
    path.join(staging, `${id}.info.json`),
    JSON.stringify({ id, title: 'TEST DJ @ Somewhere 2026 (Full Set)', channel: 'Test DJ', duration: 45, description: '0:00 Intro\n0:15 Artist One - First\n0:30 Artist Two - Second' }),
  );
  // Its thumbnail as YouTube's smaller ones come: 4:3, the 16:9 picture between black bars.
  execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=480x270:d=1', '-vf', 'pad=480:360:0:45', '-frames:v', '1', path.join(staging, `${id}-thumb.jpg`)]);
  writeFileSync(path.join(staging, `${id}.part.webm.part`), '');
  const sent = [];
  const encore = createEncore({ stagingDir: staging, libraryDir: library, dataDir: path.join(root, 'data'), ffmpeg: FFMPEG, telegram: { enabled: true, notify: async (s) => sent.push(...s) }, log: quiet });

  assert.equal(await encore.scan(), 0, 'a download with a .part beside it is not done yet');
  execFileSync('rm', [path.join(staging, `${id}.part.webm.part`)]);
  assert.equal(await encore.scan(), 1);
  assert.equal(await encore.scan(), 0, 'found once');
  assert.deepEqual(sent.map((s) => [s.id, s.trackCount, s.sourceLabel]), [[id, 3, 'Description']]);

  const detail = await encore.detail(id);
  assert.equal(detail.status, 'waiting');
  assert.deepEqual(detail.draft.tracks.map((t) => t.title), ['Intro', 'First', 'Second']);
  assert.equal(detail.draft.album, 'TEST DJ @ Somewhere 2026');
  assert.equal(detail.draft.albumArtist, 'Test DJ');

  // Trim the first 2 s; the first track starts there.
  encore.saveDraft(id, { ...detail.draft, trimIn: 2 });
  assert.equal(encore.publish(id).ok, true);
  const settled = async () => {
    for (let i = 0; i < 200 && encore.list()[0].job; i++) await new Promise((r) => setTimeout(r, 50));
  };
  await settled();
  let set = encore.list()[0];
  assert.equal(set.error, null);
  assert.equal(set.status, 'published');
  assert.equal(set.changed, false);
  const files = readdirSync(library).sort();
  assert.deepEqual(files, [
    `TEST DJ @ Somewhere 2026 - 01 - Test DJ - Intro [${id}].mp3`,
    `TEST DJ @ Somewhere 2026 - 02 - Artist One - First [${id}].mp3`,
    `TEST DJ @ Somewhere 2026 - 03 - Artist Two - Second [${id}].mp3`,
  ]);
  const probe = (file) =>
    JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:format_tags=title,artist,album,album_artist,track', '-of', 'json', path.join(library, file)])).format;
  const second = probe(files[1]);
  assert.deepEqual(
    { title: second.tags.title, artist: second.tags.artist, album: second.tags.album, albumArtist: second.tags.album_artist, track: second.tags.track },
    { title: 'First', artist: 'Artist One', album: 'TEST DJ @ Somewhere 2026', albumArtist: 'Test DJ', track: '2/3' },
  );
  const covers = files.map((f) =>
    JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height:stream_disposition=attached_pic', '-of', 'json', path.join(library, f)])).streams,
  );
  assert.deepEqual(
    covers.map((s) => s.map((v) => [v.width, v.height, v.disposition.attached_pic])),
    [[[720, 720, 1]], [[720, 720, 1]], [[720, 720, 1]]],
    'every track carries the square cover, the ones after a cut too',
  );
  const lengths = files.map((f) => Number(probe(f).duration));
  assert.ok(Math.abs(lengths[0] - 13) < 0.1, `the first track runs from the trim: ${lengths[0]}`);
  assert.ok(Math.abs(lengths.reduce((a, b) => a + b) - 43) < 0.1, `nothing lost at the joins: ${lengths}`);

  // An edit shows as a change; publishing again replaces the files, renamed ones included.
  const tracks = encore.store.get(id).draft.tracks.map((t, i) => (i === 2 ? { ...t, title: 'Second (VIP)' } : t));
  encore.saveDraft(id, { ...encore.store.get(id).draft, tracks });
  assert.equal(encore.list()[0].changed, true);
  encore.publish(id);
  await settled();
  set = encore.list()[0];
  assert.equal(set.changed, false);
  assert.deepEqual(readdirSync(library).sort().at(-1), `TEST DJ @ Somewhere 2026 - 03 - Artist Two - Second (VIP) [${id}].mp3`);
  assert.equal(readdirSync(library).length, 3, 'the old name is gone');

  assert.deepEqual(await encore.remove(id), { ok: true });
  assert.deepEqual(readdirSync(library), []);
  assert.equal(encore.list()[0].status, 'removed');

  // A draft with errors never reaches the queue.
  encore.saveDraft(id, { ...encore.store.get(id).draft, tracks: [{ start: 0, artist: '', title: 'A' }, { start: 99, artist: '', title: 'B' }] });
  const refused = encore.publish(id);
  assert.equal(refused.ok, false);
  assert.deepEqual(refused.issues.map((i) => i.code), ['end']);
  encore.stop();
});
