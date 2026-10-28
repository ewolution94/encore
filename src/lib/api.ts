// The server's API (server/api.mjs), typed for the page.

import type { Track } from '../../shared/tracklist.mjs';

export type { Track };

export interface Draft {
  album: string;
  albumArtist: string;
  trimIn: number;
  trimOut: number | null;
  tracks: Track[];
  source: string | null;
}

export interface Job {
  id: string;
  phase: 'queued' | 'encoding' | 'cutting' | 'copying';
  done: number;
  position?: number;
}

export interface SetSummary {
  id: string;
  title: string;
  channel: string;
  duration: number;
  status: 'waiting' | 'published' | 'removed';
  missing: boolean;
  album: string;
  albumArtist: string;
  trackCount: number;
  source: string | null;
  changed: boolean;
  error: string | null;
  foundAt: string;
  publishedAt: string | null;
  job: Job | null;
}

export interface Source {
  key: string;
  kind: 'description' | 'comment' | 'chapters';
  label: string;
  author?: string;
  likes?: number;
  tracks: Track[];
}

export interface SetDetail extends SetSummary {
  url: string;
  draft: Draft;
  published: Draft | null;
  files: string[];
  sources: Source[];
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: { error?: string; message?: string; issues?: { index: number; message: string }[] },
  ) {
    super(body.message ?? body.error ?? `HTTP ${status}`);
  }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const api = {
  sets: () => call<SetSummary[]>('GET', '/api/sets'),
  set: (id: string) => call<SetDetail>('GET', `/api/sets/${id}`),
  save: (id: string, draft: Draft) => call<SetDetail>('PUT', `/api/sets/${id}`, draft),
  publish: (id: string) => call<{ ok: true }>('POST', `/api/sets/${id}/publish`),
  remove: (id: string) => call<{ ok: true }>('POST', `/api/sets/${id}/remove`),
  scan: () => call<{ found: number }>('POST', '/api/scan'),
  thumb: (id: string) => `/api/sets/${id}/thumb`,
};
