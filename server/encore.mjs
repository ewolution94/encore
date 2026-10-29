// Encore's core, shared by the production server and the dev server: the scan of staging (once a
// minute), the sets and their drafts, and the publish queue (one job at a time).

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { checkTracks, guessNames } from '../shared/tracklist.mjs';
import { withDeadline } from './deadline.mjs';
import { publishSet, removeFiles, trackTags } from './publish.mjs';
import { defaultSource, sourcesOf } from './sources.mjs';
import { readInfo, readStaging } from './staging.mjs';
import { openStore } from './store.mjs';

const SCAN_DEADLINE = 60_000;
const LIMITS = { text: 300, tracks: 500 };

/** A draft as the page sent it, made safe to store: known fields, sane types, bounded sizes. */
export function cleanDraft(input, duration) {
  const text = (value, max = LIMITS.text) => String(value ?? '').slice(0, max);
  const time = (value) => (Number.isFinite(value) && value >= 0 ? Math.min(value, duration) : null);
  const tracks = Array.isArray(input?.tracks) ? input.tracks.slice(0, LIMITS.tracks) : [];
  return {
    album: text(input?.album, 200),
    albumArtist: text(input?.albumArtist, 200),
    trimIn: time(input?.trimIn) ?? 0,
    trimOut: time(input?.trimOut),
    tracks: tracks.map((t) => ({ start: time(t?.start), artist: text(t?.artist), title: text(t?.title) })),
    source: input?.source == null ? null : text(input.source, 100),
  };
}

/** What the page needs to say about a draft against what was published. */
function sameDraft(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function createEncore({ stagingDir, libraryDir, dataDir, ffmpeg = 'ffmpeg', telegram, scanEveryMs = 60_000, log = console }) {
  mkdirSync(dataDir, { recursive: true });
  const store = openStore(path.join(dataDir, 'encore.db'));
  const workDir = path.join(dataDir, 'work');
  let downloads = new Map();
  const scanState = { finishedAt: 0, error: null };
  let scanning;
  let timer;

  async function scanOnce() {
    downloads = await readStaging(stagingDir);
    const fresh = [];
    for (const [id, download] of downloads) {
      const info = await readInfo(download.info);
      const meta = { id, title: info.title, channel: info.channel, duration: info.duration, url: info.url };
      const known = store.get(id);
      if (known) {
        if (known.missing || known.title !== meta.title || known.duration !== meta.duration) store.updateMeta(meta, false);
        continue;
      }
      const source = defaultSource(sourcesOf(info));
      const names = guessNames(info);
      const draft = { ...names, trimIn: 0, trimOut: null, tracks: source?.tracks ?? [], source: source?.key ?? null };
      if (store.insert(meta, draft)) fresh.push({ ...meta, trackCount: draft.tracks.length, sourceLabel: source?.label ?? '' });
    }
    for (const set of store.all()) {
      if (!set.missing && !downloads.has(set.id)) store.markMissing(set.id);
    }
    if (fresh.length) {
      log.info(`Found ${fresh.length} new set(s): ${fresh.map((s) => s.id).join(', ')}`);
      void telegram?.notify(fresh);
    }
    return fresh.length;
  }

  /** One scan at a time; a call during a scan joins it. Every scan ends on its deadline. */
  function scan() {
    scanning ??= withDeadline(SCAN_DEADLINE, () => scanOnce())
      .then((found) => {
        scanState.error = null;
        return found;
      })
      .catch((error) => {
        scanState.error = error.code === 'ENOENT' ? 'staging folder missing' : error.name === 'DeadlineError' ? 'timeout' : 'failed';
        log.error(`Scan: ${error.message}`);
        return 0;
      })
      .finally(() => {
        scanState.finishedAt = Date.now();
        scanning = undefined;
      });
    return scanning;
  }

  function loop() {
    timer = setTimeout(async () => {
      await scan();
      loop();
    }, scanEveryMs);
  }

  // The publish queue: one job at a time, in the order asked.
  const queue = [];
  let current = null;

  async function work() {
    if (current) return;
    while (queue.length) {
      const id = queue.shift();
      const set = store.get(id);
      const download = downloads.get(id);
      if (!set || !download) continue;
      current = { id, phase: 'encoding', done: 0 };
      const draft = set.draft;
      try {
        const files = await publishSet({
          id,
          audio: download.audio,
          thumb: download.thumb,
          duration: set.duration,
          draft,
          libraryDir,
          workDir,
          ffmpeg,
          onProgress: (phase, done) => {
            current = { id, phase, done };
          },
        });
        const stale = set.files.filter((name) => !files.includes(name));
        await removeFiles(libraryDir, stale);
        store.markPublished(id, draft, files);
        log.info(`Published ${id}: ${files.length} track(s)`);
      } catch (error) {
        store.setError(id, error.name === 'FfmpegError' ? error.message : 'Publishing failed.');
        log.error(`Publishing ${id} failed: ${error.message}${error.tail ? `\n${error.tail}` : ''}`);
      }
      current = null;
    }
  }

  function jobOf(id) {
    if (current?.id === id) return current;
    const position = queue.indexOf(id);
    return position === -1 ? null : { id, phase: 'queued', done: 0, position };
  }

  function summary(set) {
    return {
      id: set.id,
      title: set.title,
      channel: set.channel,
      duration: set.duration,
      status: set.status,
      missing: set.missing,
      album: set.draft.album,
      albumArtist: set.draft.albumArtist,
      trackCount: set.draft.tracks.length,
      source: set.draft.source,
      changed: set.status === 'published' && !sameDraft(set.draft, set.published),
      error: set.error,
      foundAt: set.foundAt,
      publishedAt: set.publishedAt,
      job: jobOf(set.id),
    };
  }

  return {
    store,
    scan,
    start() {
      void scan().then(loop);
    },
    stop() {
      clearTimeout(timer);
      store.close();
    },
    list: () => store.all().map(summary),
    async detail(id) {
      const set = store.get(id);
      if (!set) return null;
      const download = downloads.get(id);
      const sources = download ? sourcesOf(await readInfo(download.info)) : [];
      return { ...summary(set), url: set.url, draft: set.draft, published: set.published, files: set.files, sources, tags: trackTags(id, set.draft) };
    },
    saveDraft(id, input) {
      const set = store.get(id);
      if (!set) return null;
      store.saveDraft(id, cleanDraft(input, set.duration));
      return store.get(id);
    },
    /** Queues a publish; refuses a draft with errors or a download that's gone. */
    publish(id) {
      const set = store.get(id);
      if (!set) return { ok: false, status: 404, error: 'not-found' };
      if (set.missing || !downloads.has(id)) return { ok: false, status: 409, error: 'missing', message: 'The download is gone from staging.' };
      const issues = checkTracks(set.draft.tracks, { duration: set.duration, trimIn: set.draft.trimIn, trimOut: set.draft.trimOut }).filter((i) => i.level === 'error');
      if (issues.length) return { ok: false, status: 422, error: 'draft', issues };
      if (!jobOf(id)) queue.push(id);
      store.setError(id, null);
      void work();
      return { ok: true };
    },
    async remove(id) {
      const set = store.get(id);
      if (!set) return { ok: false, status: 404, error: 'not-found' };
      if (jobOf(id)) return { ok: false, status: 409, error: 'busy', message: 'Wait until publishing is done.' };
      await removeFiles(libraryDir, set.files);
      store.markRemoved(id);
      return { ok: true };
    },
    thumb: (id) => downloads.get(id)?.thumb ?? null,
    status: () => ({ scannedAt: scanState.finishedAt ? new Date(scanState.finishedAt).toISOString() : null, scanError: scanState.error, job: current, queued: queue.length, telegram: Boolean(telegram?.enabled) }),
    /** Alive means a scan has finished (well or badly) recently: a hung loop shows here. */
    healthy: () => scanState.finishedAt === 0 || Date.now() - scanState.finishedAt < scanEveryMs * 3 + SCAN_DEADLINE,
  };
}
