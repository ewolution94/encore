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
//   - puts the tracks in track-number order, and puts them in order again if the set changed
//     (Encore published it again).
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

  let running = null;

  /** One pass; a call while one runs joins it. Resolves to what it did, for the log and the tests. */
  function sync() {
    running ??= (async () => {
      const done = { created: [], updated: [], waiting: [] };
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
        const existing = playlists.get(set.name);
        if (!existing) {
          const uri = await RootlistAPI.createPlaylist(set.name, { before: 'start' });
          await RootlistAPI.move([{ uri }], { after: { uri: home.uri } });
          await PlaylistAPI.add(uri, set.uris, { after: 'end' });
          playlists.set(set.name, uri);
          done.created.push(set.name);
          continue;
        }
        const items = await contents(existing);
        const same = items.length === set.uris.length && items.every((item, i) => item.uri === set.uris[i]);
        if (same) continue;
        if (items.length) await PlaylistAPI.remove(existing, items.map(({ uri, uid }) => ({ uri, uid })));
        await PlaylistAPI.add(existing, set.uris, { after: 'end' });
        done.updated.push(set.name);
      }
      return done;
    })()
      .then((done) => {
        for (const name of done.created) globalThis.Spicetify.showNotification?.(`Encore: “${name}” is in Livesets`);
        if (done.created.length || done.updated.length) console.log(TAG, done);
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
