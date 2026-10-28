// Publishing a set: the trimmed set encoded once (MP3, CBR 320, no bit reservoir), then cut into
// its tracks at frame boundaries without encoding again, so nothing pads the joins and Spotify plays
// them through (plans/encore.md, Phase 0's gap tests). The tracks are tagged, then moved into the
// library each under a temporary dot-name first, so Drive and Spotify never see half a file.

import { copyFile, mkdir, rename, rm, unlink } from 'node:fs/promises';
import path from 'node:path';
import { cutPlan } from '../shared/tracklist.mjs';
import { runFfmpeg } from './ffmpeg.mjs';

/** A name that Windows, Drive and Spotify all take: no reserved characters, no trailing dot or
 *  space, each part cut at a word. */
export function cleanPart(text, max) {
  let part = String(text ?? '')
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (part.length > max) part = part.slice(0, max).replace(/\s+\S*$/, '') || part.slice(0, max);
  return part.replace(/[. ]+$/, '').trim();
}

/** "<album> - 07 - <artist> - <title> [<video id>].mp3"; the id keeps two sets' files apart and
 *  tells Encore which files are its own. */
export function trackFileName({ id, album, number, total, artist, title }) {
  const digits = String(total).length < 2 ? 2 : String(total).length;
  const parts = [cleanPart(album, 60) || id, String(number).padStart(digits, '0'), cleanPart(artist, 40), cleanPart(title, 60)].filter(Boolean);
  return `${parts.join(' - ')} [${id}].mp3`;
}

/** Every track as it will be tagged and named: the list's artist, else the set's DJ. */
export function trackTags(id, draft) {
  const tracks = draft.tracks.length ? draft.tracks : [{ start: draft.trimIn ?? 0, artist: '', title: draft.album }];
  const total = tracks.length;
  return tracks.map((track, i) => {
    const artist = String(track.artist ?? '').trim() || draft.albumArtist;
    const title = String(track.title ?? '').trim() || `Track ${i + 1}`;
    return {
      number: i + 1,
      total,
      artist,
      title,
      file: trackFileName({ id, album: draft.album, number: i + 1, total, artist, title }),
    };
  });
}

/**
 * @param {{
 *   id: string, audio: string, duration: number, draft: any,
 *   libraryDir: string, workDir: string, ffmpeg: string,
 *   onProgress?: (phase: 'encoding' | 'cutting' | 'copying', done: number) => void,
 *   signal?: AbortSignal,
 * }} job
 * @returns {Promise<string[]>} the file names written into the library
 */
export async function publishSet({ id, audio, duration, draft, libraryDir, workDir, ffmpeg, onProgress = () => {}, signal }) {
  const trimIn = draft.trimIn ?? 0;
  const end = draft.trimOut ?? duration;
  const plan = cutPlan(draft.tracks, { duration, trimIn, trimOut: draft.trimOut });
  const tags = trackTags(id, draft);
  const dir = path.join(workDir, id);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  try {
    const whole = path.join(dir, 'whole.mp3');
    onProgress('encoding', 0);
    // prettier-ignore
    await runFfmpeg(ffmpeg, [
      '-ss', String(trimIn), '-t', String(end - trimIn), '-i', audio,
      '-vn', '-map_metadata', '-1', '-ar', '44100', '-ac', '2',
      '-c:a', 'libmp3lame', '-b:a', '320k', '-reservoir', '0', whole,
    ], { onSeconds: (s) => onProgress('encoding', Math.min(1, s / (end - trimIn))), signal });

    const parts = [];
    for (const [i, cut] of plan.entries()) {
      const tag = tags[i];
      const out = path.join(dir, `${String(i + 1).padStart(4, '0')}.mp3`);
      // The first part takes no -ss and the last no -to: an -ss of 0 drops the encoder's priming
      // frame, which sits before zero (learnings/projects/encore.md).
      // prettier-ignore
      await runFfmpeg(ffmpeg, [
        '-i', whole,
        ...(i === 0 ? [] : ['-ss', cut.from.toFixed(3)]),
        ...(cut.to === null ? [] : ['-to', cut.to.toFixed(3)]),
        '-c', 'copy', '-write_xing', '0', '-map_metadata', '-1', '-id3v2_version', '3',
        '-metadata', `title=${tag.title}`, '-metadata', `artist=${tag.artist}`,
        '-metadata', `album=${draft.album}`, '-metadata', `album_artist=${draft.albumArtist}`,
        '-metadata', `track=${tag.number}/${tag.total}`, out,
      ], { timeoutMs: 120_000, signal });
      parts.push({ from: out, name: tag.file });
      onProgress('cutting', (i + 1) / plan.length);
    }

    await mkdir(libraryDir, { recursive: true });
    for (const [i, part] of parts.entries()) {
      const temporary = path.join(libraryDir, `.${part.name}.encore-tmp`);
      await copyFile(part.from, temporary);
      await rename(temporary, path.join(libraryDir, part.name));
      onProgress('copying', (i + 1) / parts.length);
    }
    return parts.map((p) => p.name);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Takes a set's files out of the library; one already gone is fine. Only names, never paths. */
export async function removeFiles(libraryDir, files) {
  for (const name of files) {
    if (name !== path.basename(name) || !name.endsWith('.mp3')) continue;
    await unlink(path.join(libraryDir, name)).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
