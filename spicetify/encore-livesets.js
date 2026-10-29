// @ts-nocheck
// Encore → Spotify: every set Encore published becomes a playlist in a "Livesets" folder.
//
// A Spicetify extension (spicetify.app) for the Spotify desktop app on the PC Synology Drive syncs
// Encore's tracks to. Spotify's Web API can't add local files to playlists or touch folders at all,
// so this runs inside the Spotify app and uses the app's own (unofficial) functions instead.
//
// Every few minutes, and when the window comes back into focus, it reads Local Files, groups the
// tracks by album (Encore gives every set its own album) and, for each set:
//   - waits until no track of it has arrived for a while, so Drive has brought them all;
//   - makes a playlist named after the album inside "Livesets", the newest set on top;
//   - puts the tracks in track-number order (Encore's whole set in one file, track 0, first), and
//     puts them in order again if the set changed (Encore published it again);
//   - gives the playlist the set's cover once: the square Encore puts on its tracks, taken from the
//     same YouTube thumbnail (Encore's file names end in the video's id).
// It never deletes anything: a set removed in Encore leaves its playlist, with its tracks greyed out.
//
// Install (Windows, PowerShell), once Spicetify is installed:
//   $data = spicetify path userdata | Where-Object { Test-Path $_ -PathType Container } | Select-Object -First 1; $ext = Join-Path $data 'Extensions'; New-Item -ItemType Directory -Force $ext | Out-Null
//   iwr https://raw.githubusercontent.com/ewolution94/encore/release/spicetify/encore-livesets.js -OutFile (Join-Path $ext 'encore-livesets.js')
//   spicetify config extensions encore-livesets.js
//   spicetify apply

(function encoreLivesets() {
  const FOLDER = 'Livesets';
  // A set counts as complete once none of its tracks arrived in the last 90 seconds.
  const SETTLED_MS = 90_000;
  const EVERY_MS = 3 * 60_000;
  const TAG = '[Encore Livesets]';
  // Playlists that got their cover, kept on this PC, so a cover is uploaded once and one changed by
  // hand stays.
  const COVERED = 'encore-livesets:covered';

  const platform = globalThis.Spicetify?.Platform;
  if (!platform?.LocalFilesAPI || !platform.RootlistAPI || !platform.PlaylistAPI) {
    setTimeout(encoreLivesets, 500);
    return;
  }
  const { LocalFilesAPI, RootlistAPI, PlaylistAPI } = platform;
  const now = () => (globalThis.EncoreLivesetsClock ?? Date.now)();

  /** Local Files as sets: album name → its tracks' URIs in track order, and when the last arrived. */
  function setsOf(tracks) {
    const sets = new Map();
    for (const track of tracks) {
      const album = track.album?.name;
      if (!album || !track.uri) continue;
      const set = sets.get(album) ?? { name: album, tracks: [], lastAdded: 0 };
      set.tracks.push(track);
      set.lastAdded = Math.max(set.lastAdded, new Date(track.addedAt ?? 0).getTime());
      sets.set(album, set);
    }
    for (const set of sets.values()) {
      set.tracks.sort((a, b) => (a.discNumber ?? 1) - (b.discNumber ?? 1) || (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
      set.uris = set.tracks.map((t) => t.uri);
    }
    return [...sets.values()];
  }

  async function folder() {
    const root = await RootlistAPI.getContents();
    const found = root.items.find((item) => item.type === 'folder' && item.name === FOLDER);
    if (found) return found;
    const made = await RootlistAPI.createFolder(FOLDER, { before: 'start' });
    return { type: 'folder', name: FOLDER, uri: typeof made === 'string' ? made : made.uri, items: [] };
  }

  async function contents(uri) {
    const result = await PlaylistAPI.getContents(uri);
    return result.items ?? [];
  }

  const covered = new Set(
    (() => {
      try {
        return JSON.parse(globalThis.localStorage?.getItem(COVERED) ?? '[]');
      } catch {
        return [];
      }
    })(),
  );
  function remember(uri) {
    covered.add(uri);
    try {
      globalThis.localStorage?.setItem(COVERED, JSON.stringify([...covered]));
    } catch {
      // Remembered until Spotify restarts; then the cover goes up once more.
    }
  }

  /** The set's YouTube id, from a track's file path (Spotify gives it as the track's picture). */
  function videoIdOf(set) {
    for (const track of set.tracks) {
      const url = track.album?.images?.[0]?.url ?? '';
      let file = url;
      try {
        file = decodeURIComponent(url);
      } catch {
        // Not encoded after all.
      }
      const match = /\[([\w-]{11})\]\.mp3$/i.exec(file);
      if (match) return match[1];
    }
    return null;
  }

  /** The cover as Encore cuts it: a 640 px square from the middle of the picture, a JPEG Spotify
   *  takes (under 256 KB). YouTube's smaller thumbnails are 4:3 with the 16:9 picture between bars,
   *  hence the square as high as the picture rather than the image. Null when YouTube has none. */
  async function coverOf(id) {
    for (const name of ['maxresdefault', 'hqdefault']) {
      const response = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
      if (!response.ok) continue;
      const image = await createImageBitmap(await response.blob());
      const side = Math.min(image.height, (image.width * 9) / 16);
      const canvas = new OffscreenCanvas(640, 640);
      canvas.getContext('2d').drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 640, 640);
      for (const quality of [0.9, 0.8, 0.65, 0.5]) {
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
        if (blob.size <= 250_000) return blob;
      }
    }
    return null;
  }

  /** Puts the set's cover on its playlist; true once it's on. */
  async function putCover(uri, set) {
    const id = videoIdOf(set);
    if (!id || typeof PlaylistAPI.uploadImage !== 'function') return false;
    const cover = await coverOf(id);
    if (!cover) return false;
    const token = await PlaylistAPI.uploadImage(new File([cover], 'cover.jpg', { type: 'image/jpeg' }));
    if (!token) return false;
    await PlaylistAPI.updateDetails(uri, { imageUploadToken: token });
    if (typeof PlaylistAPI.resync === 'function') await PlaylistAPI.resync(uri);
    return true;
  }

  let running = null;

  /** One pass; a call while one runs joins it. Resolves to what it did, for the log and the tests. */
  function sync() {
    running ??= (async () => {
      const done = { created: [], updated: [], covered: [], waiting: [] };
      const sets = setsOf(await LocalFilesAPI.getTracks());
      if (!sets.length) return done;
      const home = await folder();
      const playlists = new Map((home.items ?? []).filter((i) => i.type === 'playlist').map((i) => [i.name, i.uri]));
      // Oldest first, so the newest set ends up on top of the folder.
      sets.sort((a, b) => a.lastAdded - b.lastAdded);
      for (const set of sets) {
        if (now() - set.lastAdded < SETTLED_MS) {
          done.waiting.push(set.name);
          continue;
        }
        let uri = playlists.get(set.name);
        if (!uri) {
          uri = await RootlistAPI.createPlaylist(set.name, { before: 'start' });
          await RootlistAPI.move([{ uri }], { after: { uri: home.uri } });
          await PlaylistAPI.add(uri, set.uris, { after: 'end' });
          playlists.set(set.name, uri);
          done.created.push(set.name);
        } else {
          const items = await contents(uri);
          const same = items.length === set.uris.length && items.every((item, i) => item.uri === set.uris[i]);
          if (!same) {
            if (items.length) await PlaylistAPI.remove(uri, items.map(({ uri: track, uid }) => ({ uri: track, uid })));
            await PlaylistAPI.add(uri, set.uris, { after: 'end' });
            done.updated.push(set.name);
          }
        }
        // The cover is a nicety: when it fails, the playlist is still there and the next pass tries again.
        if (!covered.has(uri)) {
          try {
            if (await putCover(uri, set)) {
              remember(uri);
              done.covered.push(set.name);
            }
          } catch (error) {
            console.warn(TAG, `no cover for “${set.name}” yet`, error);
          }
        }
      }
      return done;
    })()
      .then((done) => {
        for (const name of done.created) globalThis.Spicetify.showNotification?.(`Encore: “${name}” is in Livesets`);
        if (done.created.length || done.updated.length || done.covered.length) console.log(TAG, done);
        return done;
      })
      .catch((error) => {
        console.error(TAG, error);
        return { error: String(error) };
      })
      .finally(() => {
        running = null;
      });
    return running;
  }

  // For the tests and for a look from the developer tools: EncoreLivesets.sync().
  globalThis.EncoreLivesets = { sync, setsOf };
  // The first pass a little after launch, once Spotify has read Local Files.
  setTimeout(() => void sync(), 15_000);
  setInterval(() => void sync(), EVERY_MS);
  globalThis.addEventListener?.('focus', () => void sync());
})();
