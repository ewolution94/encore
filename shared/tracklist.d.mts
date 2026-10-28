// Types for tracklist.mjs, for the page's TypeScript.

export interface Track {
  start: number | null;
  artist: string;
  title: string;
}

export interface Issue {
  index: number;
  level: 'error' | 'warn';
  code: 'trim' | 'time' | 'title' | 'order' | 'end' | 'short';
  message: string;
}

export interface Cut {
  index: number;
  from: number;
  to: number | null;
  length: number;
}

export function parseTime(text: string): number | null;
export function formatTime(seconds: number, long?: boolean): string;
export function splitArtistTitle(text: string): { artist: string; title: string };
export function parseLine(line: string): { start: number; artist: string; title: string } | null;
export function parseTracklist(text: string): { start: number; artist: string; title: string }[];
export function checkTracks(tracks: Track[], set: { duration: number; trimIn?: number; trimOut?: number | null }): Issue[];
export function cutPlan(tracks: Track[], set: { duration: number; trimIn?: number; trimOut?: number | null }): Cut[];
export function guessNames(info: { title?: string; channel?: string }): { album: string; albumArtist: string };
