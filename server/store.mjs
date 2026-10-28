// Encore's own state, in one SQLite file: every set it has found in staging, the user's draft for it
// (names, trim, tracklist), what was last published and which files that wrote. The audio and the
// info JSON stay Pinchflat's, in staging.

import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS sets (
    id TEXT PRIMARY KEY,            -- the YouTube video id, Pinchflat's file name
    title TEXT NOT NULL,
    channel TEXT NOT NULL,
    duration REAL NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'published', 'removed')),
    missing INTEGER NOT NULL DEFAULT 0, -- the download has left staging
    draft TEXT NOT NULL,            -- JSON: album, albumArtist, trimIn, trimOut, tracks, source
    published TEXT,                 -- JSON: the draft as last published
    files TEXT NOT NULL DEFAULT '[]', -- JSON: the file names in the library
    error TEXT,
    found_at TEXT NOT NULL,
    published_at TEXT,
    removed_at TEXT
  );
`;

function toSet(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    channel: row.channel,
    duration: row.duration,
    url: row.url,
    status: row.status,
    missing: row.missing === 1,
    draft: JSON.parse(row.draft),
    published: row.published ? JSON.parse(row.published) : null,
    files: JSON.parse(row.files),
    error: row.error,
    foundAt: row.found_at,
    publishedAt: row.published_at,
    removedAt: row.removed_at,
  };
}

export function openStore(file) {
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 2000;');
  db.exec(SCHEMA);
  const now = () => new Date().toISOString();
  const statements = {
    all: db.prepare('SELECT * FROM sets ORDER BY found_at DESC'),
    get: db.prepare('SELECT * FROM sets WHERE id = ?'),
    insert: db.prepare(
      `INSERT OR IGNORE INTO sets (id, title, channel, duration, url, draft, found_at)
       VALUES (:id, :title, :channel, :duration, :url, :draft, :found_at)`,
    ),
    meta: db.prepare('UPDATE sets SET title = :title, channel = :channel, duration = :duration, url = :url, missing = :missing WHERE id = :id'),
    draft: db.prepare('UPDATE sets SET draft = ? WHERE id = ?'),
    published: db.prepare(
      "UPDATE sets SET status = 'published', published = ?, files = ?, error = NULL, published_at = ?, removed_at = NULL WHERE id = ?",
    ),
    removed: db.prepare("UPDATE sets SET status = 'removed', files = '[]', error = NULL, removed_at = ? WHERE id = ?"),
    error: db.prepare('UPDATE sets SET error = ? WHERE id = ?'),
  };

  return {
    all: () => statements.all.all().map(toSet),
    get: (id) => toSet(statements.get.get(id)),
    /** A set seen in staging for the first time. False when it was known already. */
    insert({ id, title, channel, duration, url }, draft) {
      const result = statements.insert.run({ id, title, channel, duration, url, draft: JSON.stringify(draft), found_at: now() });
      return result.changes > 0;
    },
    updateMeta({ id, title, channel, duration, url }, missing) {
      statements.meta.run({ id, title, channel, duration, url, missing: missing ? 1 : 0 });
    },
    saveDraft(id, draft) {
      statements.draft.run(JSON.stringify(draft), id);
    },
    markMissing(id) {
      db.prepare('UPDATE sets SET missing = 1 WHERE id = ?').run(id);
    },
    markPublished(id, draft, files) {
      statements.published.run(JSON.stringify(draft), JSON.stringify(files), now(), id);
    },
    markRemoved(id) {
      statements.removed.run(now(), id);
    },
    setError(id, message) {
      statements.error.run(message, id);
    },
    close: () => db.close(),
  };
}
