// Tracklists: reading them out of text (a video's description, a comment, a pasted list), times
// as people write them, the checks before a set is cut, and the cut itself as a plan. Plain
// JavaScript without dependencies: the server and the page import the same file.

const TIME = String.raw`(?:\d{1,2}:)?\d{1,2}:\d{2}`;
// Bullets and numbering before a line's time: "•", "▶", "01.", "1)", "#1".
const MARKER = /^(?:[-–—*•·▶►→>]+|#?\d{1,3}[.)](?=\s)|#\d{1,3})\s*/;
const LEADING_TIME = new RegExp(String.raw`^[\[(]?(${TIME})[\])]?`);
// A range's end after the start ("00:00 - 02:30 Artist - Title").
const RANGE_END = new RegExp(String.raw`^\s*[-–—~]\s*[\[(]?${TIME}[\])]?(?=\s|$)`);
// A time at the end, apart from what's before it (not the "?t=12:34" of a link).
const TRAILING_TIME = new RegExp(String.raw`(?<=\s)[\[(]?(${TIME})[\])]?\s*$`);
const ARTIST_TITLE = /\s[-–—]\s/;
const INVISIBLE = /[​-‏⁠﻿]/g;

/** "1:02:03" → 3723, "12:34" → 754; null for anything else. Minutes may run past 59 without hours. */
export function parseTime(text) {
  const match = /^\s*(?:(\d{1,2}):)?(\d{1,3}):(\d{2})\s*$/.exec(String(text ?? ''));
  if (!match) return null;
  const [, h, m, s] = match;
  if (Number(s) > 59 || (h !== undefined && Number(m) > 59)) return null;
  return Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s);
}

/** 3723 → "1:02:03", 754 → "12:34"; `long` gives hours even under one (for a set over an hour). */
export function formatTime(seconds, long = false) {
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 || long ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** "Artist - Title" → { artist, title }; without a dash the line is the title and the artist is left
 *  to the set's DJ (""). Only the first dash splits, so a mashup keeps its "vs …" in the title. */
export function splitArtistTitle(text) {
  const clean = String(text ?? '').trim();
  const at = clean.search(ARTIST_TITLE);
  if (at > 0) {
    const artist = clean.slice(0, at).trim();
    const title = unquote(clean.slice(at).replace(/^\s*[-–—]\s*/, ''));
    if (artist && title) return { artist, title };
  }
  return { artist: '', title: unquote(clean) };
}

function unquote(text) {
  const match = /^["“”'‘’](.+)["“”'’]$/.exec(text.trim());
  return (match ? match[1] : text).trim();
}

/** One line of a tracklist → { start, artist, title }, or null when the line has no time. */
export function parseLine(line) {
  let text = String(line ?? '').replace(INVISIBLE, '').trim();
  for (let i = 0; i < 2; i++) text = text.replace(MARKER, '');
  let start = null;
  const leading = LEADING_TIME.exec(text);
  if (leading && (text.length === leading[0].length || /[\s\-–—|:.)\]]/.test(text[leading[0].length]))) {
    start = parseTime(leading[1]);
    text = text.slice(leading[0].length).replace(RANGE_END, '');
  } else {
    const trailing = TRAILING_TIME.exec(text);
    if (trailing && trailing.index > 0) {
      start = parseTime(trailing[1]);
      text = text.slice(0, trailing.index);
      for (let i = 0; i < 2; i++) text = text.replace(MARKER, '');
    }
  }
  if (start === null) return null;
  text = text.replace(/^[\s\-–—|:.~>]+/, '').replace(/[\s\-–—|:]+$/, '');
  if (!text) return null;
  return { start, ...splitArtistTitle(text) };
}

/** Every timed line of a text, in the order written, without repeats. Fewer than two is no list. */
export function parseTracklist(text) {
  const rows = [];
  const seen = new Set();
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const row = parseLine(line);
    if (!row) continue;
    const key = `${row.start}|${row.artist}|${row.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows.length >= 2 ? rows : [];
}

const MIN_TRACK = 5;

/**
 * What's wrong with a draft before it's cut: per track (`index`) and for the set (`index` -1).
 * `level` 'error' stops publishing; 'warn' only says so.
 */
export function checkTracks(tracks, { duration, trimIn = 0, trimOut = null }) {
  const issues = [];
  const end = trimOut ?? duration;
  if (!(end > trimIn)) issues.push({ index: -1, level: 'error', code: 'trim', message: 'The end must come after the start.' });
  tracks.forEach((track, index) => {
    if (!Number.isFinite(track.start)) {
      issues.push({ index, level: 'error', code: 'time', message: 'Needs a time like 12:34.' });
      return;
    }
    if (!String(track.title ?? '').trim()) issues.push({ index, level: 'error', code: 'title', message: 'Needs a title.' });
    const before = tracks[index - 1];
    if (before && Number.isFinite(before.start) && track.start <= before.start) {
      issues.push({ index, level: 'error', code: 'order', message: track.start === before.start ? 'Starts at the same time as the track above.' : 'Starts before the track above.' });
    }
    if (track.start >= end) issues.push({ index, level: 'error', code: 'end', message: 'Starts after the set ends.' });
    else if (index > 0 && track.start <= trimIn) issues.push({ index, level: 'error', code: 'trim', message: 'Starts before the set does.' });
    // Only a real, short length: one at or below zero is already an error on this track or the next.
    const next = tracks[index + 1];
    const until = next && Number.isFinite(next.start) ? next.start : end;
    const length = until - (index === 0 ? Math.max(track.start, trimIn) : track.start);
    if (length > 0 && length < MIN_TRACK) {
      issues.push({ index, level: 'warn', code: 'short', message: `Shorter than ${MIN_TRACK} seconds.` });
    }
  });
  return issues;
}

/**
 * The cut as a plan, in seconds from the trimmed start: every track's `from` and `to` (null for
 * the last, which runs to the end). The first track always starts at the trim, so whatever comes
 * before the first time belongs to it. No tracks: the whole set is one.
 */
export function cutPlan(tracks, { duration, trimIn = 0, trimOut = null }) {
  const end = trimOut ?? duration;
  if (!tracks.length) return [{ index: 0, from: 0, to: null, length: end - trimIn }];
  return tracks.map((track, index) => {
    const from = index === 0 ? 0 : track.start - trimIn;
    const next = tracks[index + 1];
    const to = next ? next.start - trimIn : null;
    return { index, from, to, length: (to ?? end - trimIn) - from };
  });
}

/**
 * A first guess at the set's album (its own name, unique per set, so Spotify keeps its tracks
 * together) and its DJ (the album artist and every track's artist where the list names none).
 */
export function guessNames({ title = '', channel = '' }) {
  const album = String(title)
    .replace(/\s*[([]\s*(?:official\s+)?full\s+(?:dj\s+)?set\s*[)\]]/gi, '')
    .replace(/\s*[([]?\b(?:4k|uhd|hd)\b[)\]]?\s*$/i, '')
    .replace(/[\s|\-–—]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const owner = String(channel).replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  const head =
    /^(.+?)\s+(?:live\s+)?(?:@|at|from|presents)\s+/i.exec(album)?.[1] ??
    /^(.+?)\s+[|\-–—]\s+/.exec(album)?.[1] ??
    '';
  let dj = head.replace(/\s+live(?:\s+set)?$/i, '').trim();
  if (!dj || dj.length > 60) dj = owner;
  if (dj.toLowerCase() === owner.toLowerCase()) dj = owner;
  return { album: album || owner, albumArtist: dj || owner };
}
