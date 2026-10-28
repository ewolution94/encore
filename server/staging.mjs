// What Pinchflat has finished downloading. Its profile names everything by the video id
// (plans/encore.md): `<id>.<audio ext>`, `<id>.info.json`, `<id>-thumb.jpg`. A download counts once
// its audio and its info JSON are both there and nothing of it is still a `.part`.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const AUDIO = ['opus', 'm4a', 'webm', 'ogg', 'mp3', 'aac', 'flac', 'wav'];
const ID = /^[\w-]{11}$/;

/** id → { id, audio, thumb, info } (absolute paths; thumb may be null). */
export async function readStaging(dir) {
  const names = await readdir(dir);
  const present = new Set(names);
  const downloads = new Map();
  for (const name of names) {
    const match = /^(.+)\.info\.json$/.exec(name);
    if (!match || !ID.test(match[1])) continue;
    const id = match[1];
    if (names.some((n) => n.startsWith(`${id}.`) && n.endsWith('.part'))) continue;
    const audio = AUDIO.map((ext) => `${id}.${ext}`).find((n) => present.has(n));
    if (!audio) continue;
    const thumb = present.has(`${id}-thumb.jpg`) ? path.join(dir, `${id}-thumb.jpg`) : null;
    downloads.set(id, { id, audio: path.join(dir, audio), thumb, info: path.join(dir, name) });
  }
  return downloads;
}

const infoCache = new Map();

/** The info JSON as Encore uses it, read again only when the file changed. */
export async function readInfo(file) {
  const { mtimeMs } = await stat(file);
  const cached = infoCache.get(file);
  if (cached && cached.mtimeMs === mtimeMs) return cached.info;
  const raw = JSON.parse(await readFile(file, 'utf8'));
  const info = {
    id: String(raw.id),
    title: String(raw.title ?? raw.id),
    channel: String(raw.channel ?? raw.uploader ?? ''),
    duration: Number(raw.duration) || 0,
    url: String(raw.webpage_url ?? `https://www.youtube.com/watch?v=${raw.id}`),
    description: String(raw.description ?? ''),
    chapters: Array.isArray(raw.chapters) ? raw.chapters : [],
    comments: Array.isArray(raw.comments) ? raw.comments : [],
  };
  infoCache.set(file, { mtimeMs, info });
  return info;
}
