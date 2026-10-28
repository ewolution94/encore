// Where a set's first tracklist can come from, read out of the info JSON Pinchflat saves beside the
// download: the description, the top comments, and YouTube's chapters. A pasted list is the page's.

import { parseTracklist } from '../shared/tracklist.mjs';

const MAX_COMMENTS = 3;

/**
 * Each source with its tracks, best first: `{ key, kind, label, tracks, likes? }`.
 * Chapters that only repeat the description's list are left out (YouTube makes them from it); the
 * rest are YouTube's own, machine-written ("Crowd interaction"), so they come last and say so.
 */
export function sourcesOf(info) {
  const sources = [];
  const fromDescription = parseTracklist(info.description);
  if (fromDescription.length) sources.push({ key: 'description', kind: 'description', label: 'Description', tracks: fromDescription });

  const lists = [];
  for (const comment of info.comments ?? []) {
    if (comment.parent && comment.parent !== 'root') continue;
    const tracks = parseTracklist(comment.text);
    if (tracks.length < 3) continue;
    lists.push({ comment, tracks });
  }
  // Most liked first: people upvote the list that's right. A copy of a list (same times and names)
  // counts once, under its most liked author.
  lists.sort((a, b) => (b.comment.like_count ?? 0) - (a.comment.like_count ?? 0) || b.tracks.length - a.tracks.length);
  const seen = new Set([signature(fromDescription)]);
  for (const { comment, tracks } of lists) {
    const sig = signature(tracks);
    if (seen.has(sig)) continue;
    seen.add(sig);
    const author = String(comment.author ?? '').replace(/^@?/, '@');
    sources.push({ key: `comment:${comment.id}`, kind: 'comment', label: `Comment by ${author}`, likes: comment.like_count ?? 0, tracks });
    if (sources.filter((s) => s.kind === 'comment').length >= MAX_COMMENTS) break;
  }

  const chapters = (info.chapters ?? [])
    .filter((c) => Number.isFinite(c.start_time) && String(c.title ?? '').trim())
    .map((c) => ({ start: Math.round(c.start_time), artist: '', title: String(c.title).trim() }));
  if (chapters.length >= 2 && !fromDescription.length) {
    sources.push({ key: 'chapters', kind: 'chapters', label: "YouTube's chapters", tracks: chapters });
  }
  return sources;
}

function signature(tracks) {
  return tracks.map((t) => `${t.start}`).join(',');
}

/** The source a new set starts from: the description, else the best comment; never YouTube's
 *  own chapters, which are almost never songs. */
export function defaultSource(sources) {
  return sources.find((s) => s.kind === 'description') ?? sources.find((s) => s.kind === 'comment') ?? null;
}
