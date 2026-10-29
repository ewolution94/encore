import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// The Spicetify extension as it ships, run against a stand-in for the Spotify app's own functions
// (the shapes of Spicetify.Platform's LocalFilesAPI, RootlistAPI and PlaylistAPI as extensions use
// them). It can't prove the real app accepts these calls; it proves what the extension asks for.
const source = readFileSync(new URL('../spicetify/encore-livesets.js', import.meta.url), 'utf8');

// YouTube's thumbnails as the stand-in knows them: video id → the sizes it has.
const THUMBS = {
  'ODi-o47ywEs': { maxresdefault: [1280, 720], hqdefault: [480, 360] },
  AbCdEfGhIjK: { hqdefault: [480, 360] },
};

function spotify({ storage = new Map() } = {}) {
  const state = { now: 1_000_000_000, local: [], root: [], playlists: new Map(), notes: [], seq: 0, fetched: [], draws: [], uploads: [], covers: new Map(), failUploads: 0 };
  const findFolder = (uri) => state.root.find((i) => i.uri === uri);
  const Platform = {
    LocalFilesAPI: { getTracks: async () => state.local.map((t) => ({ ...t })) },
    RootlistAPI: {
      getContents: async () => ({ name: '<root>', items: state.root.map((i) => ({ ...i, items: i.items?.map((c) => ({ ...c })) })) }),
      createFolder: async (name) => {
        const folder = { type: 'folder', name, uri: `spotify:user:me:folder:${++state.seq}`, items: [] };
        state.root.unshift(folder);
        return { uri: folder.uri };
      },
      createPlaylist: async (name) => {
        const uri = `spotify:playlist:${++state.seq}`;
        state.root.unshift({ type: 'playlist', name, uri });
        state.playlists.set(uri, []);
        return uri;
      },
      // `after` a folder's URI puts the item first inside it.
      move: async (items, { after }) => {
        const folder = findFolder(after.uri);
        for (const { uri } of items) {
          const at = state.root.findIndex((i) => i.uri === uri);
          const [item] = state.root.splice(at, 1);
          folder.items.unshift(item);
        }
      },
    },
    PlaylistAPI: {
      getContents: async (uri) => ({ items: state.playlists.get(uri).map((i) => ({ ...i })) }),
      add: async (uri, uris) => {
        for (const u of uris) state.playlists.get(uri).push({ uri: u, uid: `uid${++state.seq}` });
      },
      remove: async (uri, items) => {
        const gone = new Set(items.map((i) => i.uid));
        state.playlists.set(uri, state.playlists.get(uri).filter((i) => !gone.has(i.uid)));
      },
      uploadImage: async (file) => {
        if (state.failUploads > 0 && state.failUploads--) throw new Error('upload refused');
        state.uploads.push({ name: file.name, type: file.type, quality: file.parts[0].quality });
        return `token${++state.seq}`;
      },
      updateDetails: async (uri, { imageUploadToken }) => {
        state.covers.set(uri, imageUploadToken);
      },
    },
  };
  class OffscreenCanvas {
    getContext() {
      return { drawImage: (_image, ...box) => state.draws.push(box) };
    }
    // Only from quality 0.8 down is the JPEG small enough.
    async convertToBlob({ type, quality }) {
      return { type, quality, size: quality > 0.8 ? 300_000 : 120_000 };
    }
  }
  const context = {
    Spicetify: { Platform, showNotification: (text) => state.notes.push(text) },
    EncoreLivesetsClock: () => state.now,
    fetch: async (url) => {
      state.fetched.push(url);
      const [, id, name] = /\/vi\/([\w-]+)\/(\w+)\.jpg$/.exec(url);
      const size = THUMBS[id]?.[name];
      return { ok: Boolean(size), blob: async () => ({ width: size[0], height: size[1] }) };
    },
    createImageBitmap: async (blob) => blob,
    OffscreenCanvas,
    File: class {
      constructor(parts, name, { type }) {
        Object.assign(this, { parts, name, type });
      }
    },
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    // No timers: each test runs its passes itself.
    setTimeout: () => 0,
    setInterval: () => 0,
    console: { log() {}, warn() {}, error: console.error },
    Date,
    Map,
    Set,
    Promise,
  };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  // Results come from the sandbox's own Object and Array: compared as plain JSON.
  return { state, sync: async () => JSON.parse(JSON.stringify(await context.EncoreLivesets.sync())) };
}

// Spotify gives a local track's picture as its file's path; Encore's file names end in the video id.
const track = (album, n, title, addedAt, id = 'ODi-o47ywEs') => ({
  uri: `spotify:local:Artist:${encodeURIComponent(album)}:${encodeURIComponent(title)}:${100 + n}`,
  name: title,
  album: { name: album, images: [{ url: `spotify:localfileimage:${encodeURIComponent(`C:\\Users\\Eric\\Music\\Encore\\${album} - ${String(n).padStart(2, '0')} - Artist - ${title} [${id}].mp3`)}` }] },
  trackNumber: n,
  discNumber: 1,
  addedAt: new Date(addedAt),
});

const folderOf = (state) => state.root.find((i) => i.type === 'folder' && i.name === 'Livesets');
const titles = (state, uri) => state.playlists.get(uri).map((i) => decodeURIComponent(i.uri.split(':')[4]));

test('each settled set becomes a playlist in Livesets, in track order, the newest on top', async () => {
  const { state, sync } = spotify();
  const old = state.now - 10 * 60_000;
  // Drive brings the files in any order; Spotify lists them in any order.
  state.local = [
    track('RIOT @ EDC 2026', 3, 'Redemption', old),
    track('RIOT @ EDC 2026', 1, 'Do or Die', old),
    track('RIOT @ EDC 2026', 11, 'ID', old),
    track('RIOT @ EDC 2026', 2, 'Torque', old),
    track('DABIN @ EDC 2026', 2, 'In the End', old + 60_000),
    track('DABIN @ EDC 2026', 1, 'Intro', old + 60_000),
  ];
  const done = await sync();
  assert.deepEqual(done.created, ['RIOT @ EDC 2026', 'DABIN @ EDC 2026']);
  const folder = folderOf(state);
  assert.deepEqual(folder.items.map((i) => i.name), ['DABIN @ EDC 2026', 'RIOT @ EDC 2026'], 'the newest set on top');
  assert.equal(state.root.filter((i) => i.type === 'playlist').length, 0, 'nothing left outside the folder');
  assert.deepEqual(titles(state, folder.items[1].uri), ['Do or Die', 'Torque', 'Redemption', 'ID']);
  assert.deepEqual(state.notes, ['Encore: “RIOT @ EDC 2026” is in Livesets', 'Encore: “DABIN @ EDC 2026” is in Livesets']);

  const again = await sync();
  assert.deepEqual([again.created, again.updated, again.covered], [[], [], []], 'a second pass changes nothing');
  assert.equal(state.root.filter((i) => i.type === 'folder').length, 1, 'one folder');
});

test('a set still arriving waits until no track has come for a while', async () => {
  const { state, sync } = spotify();
  state.local = [track('Arriving', 1, 'One', state.now - 20_000), track('Arriving', 2, 'Two', state.now - 5_000)];
  const first = await sync();
  assert.deepEqual(first.waiting, ['Arriving']);
  assert.equal(state.playlists.size, 0);

  state.local.push(track('Arriving', 3, 'Three', state.now));
  state.now += 2 * 60_000;
  const later = await sync();
  assert.deepEqual(later.created, ['Arriving']);
  assert.deepEqual(titles(state, folderOf(state).items[0].uri), ['One', 'Two', 'Three']);
});

test('a set published again (a renamed track, one more) is put in order again in the same playlist', async () => {
  const { state, sync } = spotify();
  const old = state.now - 10 * 60_000;
  state.local = [track('Set', 1, 'Intro', old), track('Set', 2, 'Song', old)];
  await sync();
  const uri = folderOf(state).items[0].uri;

  state.local = [track('Set', 1, 'Intro', old), track('Set', 2, 'Song (VIP)', old + 1), track('Set', 3, 'Outro', old + 2)];
  const done = await sync();
  assert.deepEqual(done.updated, ['Set']);
  assert.equal(folderOf(state).items.length, 1, 'no second playlist');
  assert.deepEqual(titles(state, uri), ['Intro', 'Song (VIP)', 'Outro']);
});

test('an existing Livesets folder is used, and nothing happens without local files', async () => {
  const { state, sync } = spotify();
  assert.deepEqual(await sync(), { created: [], updated: [], covered: [], waiting: [] });
  assert.equal(state.root.length, 0, 'no folder made for nothing');

  state.root.push({ type: 'folder', name: 'Livesets', uri: 'spotify:user:me:folder:old', items: [] });
  state.local = [track('Set', 1, 'Intro', state.now - 10 * 60_000)];
  await sync();
  assert.equal(state.root.length, 1);
  assert.equal(folderOf(state).uri, 'spotify:user:me:folder:old');
  assert.equal(folderOf(state).items.length, 1);
});

test('each playlist gets its set’s cover once: a square from the middle of the largest thumbnail YouTube has', async () => {
  const storage = new Map();
  const { state, sync } = spotify({ storage });
  const old = state.now - 10 * 60_000;
  state.local = [track('RIOT @ EDC 2026', 1, 'Do or Die', old), track('DABIN @ EDC 2026', 1, 'Intro', old + 1, 'AbCdEfGhIjK')];
  const done = await sync();
  assert.deepEqual(done.covered, ['RIOT @ EDC 2026', 'DABIN @ EDC 2026']);
  assert.deepEqual(state.fetched, [
    'https://i.ytimg.com/vi/ODi-o47ywEs/maxresdefault.jpg',
    'https://i.ytimg.com/vi/AbCdEfGhIjK/maxresdefault.jpg',
    'https://i.ytimg.com/vi/AbCdEfGhIjK/hqdefault.jpg',
  ]);
  assert.deepEqual(
    JSON.parse(JSON.stringify(state.draws)),
    [
      [280, 0, 720, 720, 0, 0, 640, 640],
      [105, 45, 270, 270, 0, 0, 640, 640],
    ],
    'the 16:9 picture’s middle, without the 4:3 thumbnail’s bars',
  );
  assert.deepEqual(state.uploads, [
    { name: 'cover.jpg', type: 'image/jpeg', quality: 0.8 },
    { name: 'cover.jpg', type: 'image/jpeg', quality: 0.8 },
  ], 'the first JPEG under 256 KB');
  assert.deepEqual([...state.covers.keys()].sort(), folderOf(state).items.map((i) => i.uri).sort(), 'both playlists took their upload');

  await sync();
  assert.equal(state.uploads.length, 2, 'not again on the next pass');
  // Nor after Spotify restarts: this PC remembers.
  const restarted = spotify({ storage });
  restarted.state.root = state.root;
  restarted.state.playlists = state.playlists;
  restarted.state.local = state.local;
  await restarted.sync();
  assert.equal(restarted.state.uploads.length, 0);
});

test('a playlist made before covers gets one, and a failed cover is tried again without holding up the others', async () => {
  const { state, sync } = spotify();
  const old = state.now - 10 * 60_000;
  state.root.push({ type: 'folder', name: 'Livesets', uri: 'spotify:user:me:folder:old', items: [{ type: 'playlist', name: 'RIOT @ EDC 2026', uri: 'spotify:playlist:riot' }] });
  state.playlists.set('spotify:playlist:riot', [{ uri: track('RIOT @ EDC 2026', 1, 'Do or Die', old).uri, uid: 'u1' }]);
  state.local = [track('RIOT @ EDC 2026', 1, 'Do or Die', old), track('New', 1, 'Intro', old + 1)];
  state.failUploads = 1;
  const first = await sync();
  assert.deepEqual([first.created, first.covered], [['New'], ['New']], 'RIOT’s upload failed, the oldest set’s first; New went ahead');
  assert.equal(state.covers.has('spotify:playlist:riot'), false);
  assert.deepEqual(titles(state, folderOf(state).items[0].uri), ['Intro']);
  const second = await sync();
  assert.deepEqual(second.covered, ['RIOT @ EDC 2026'], 'tried again on the next pass');
  assert.equal(state.covers.size, 2);
});

test('a set whose files aren’t Encore’s gets no cover and costs no download', async () => {
  const { state, sync } = spotify();
  const mine = { ...track('My mix', 1, 'Intro', state.now - 10 * 60_000), album: { name: 'My mix', images: [] } };
  state.local = [mine];
  const done = await sync();
  assert.deepEqual([done.created, done.covered], [['My mix'], []]);
  assert.deepEqual(state.fetched, []);
});

test('the full set, track 0, leads its playlist, also when Spotify reads no number for it', async () => {
  const { state, sync } = spotify();
  const old = state.now - 10 * 60_000;
  state.local = [track('Set', 2, 'Song', old), track('Set', 1, 'Intro', old), track('Set', 0, 'Full set', old)];
  await sync();
  assert.deepEqual(titles(state, folderOf(state).items[0].uri), ['Full set', 'Intro', 'Song']);

  // A set published before the full set existed: the next pass puts it first in the same playlist.
  const later = spotify();
  later.state.local = [track('Old', 1, 'Intro', old), track('Old', 2, 'Song', old)];
  await later.sync();
  later.state.local.push({ ...track('Old', 0, 'Full set', old + 60_000), trackNumber: undefined });
  const done = await later.sync();
  assert.deepEqual(done.updated, ['Old']);
  assert.deepEqual(titles(later.state, folderOf(later.state).items[0].uri), ['Full set', 'Intro', 'Song']);
});
