// Encore's JSON API under /api, for the page. Every handler answers or returns false.
//
//   GET  /api/sets                 the list
//   GET  /api/sets/:id             one set: its draft, sources, published state, tags
//   PUT  /api/sets/:id             save the draft
//   POST /api/sets/:id/publish     queue it
//   POST /api/sets/:id/remove      take its tracks out of the library
//   GET  /api/sets/:id/thumb       Pinchflat's thumbnail
//   POST /api/scan                 look at staging now
//   GET  /api/status

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

const MAX_BODY = 1024 * 1024;
const ID = /^[\w-]{11}$/;

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
  return true;
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('too large'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
  } catch {
    throw Object.assign(new Error('bad json'), { status: 400 });
  }
}

export function createApi(encore) {
  return async function api(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (!pathname.startsWith('/api/')) return false;
    const parts = pathname.split('/').filter(Boolean).slice(1);
    const method = req.method;

    try {
      if (parts[0] === 'status' && parts.length === 1 && method === 'GET') return json(res, 200, encore.status());
      if (parts[0] === 'scan' && parts.length === 1 && method === 'POST') {
        const found = await encore.scan();
        return json(res, 200, { found });
      }
      if (parts[0] !== 'sets') return json(res, 404, { error: 'not-found' });
      if (parts.length === 1 && method === 'GET') return json(res, 200, encore.list());

      const id = parts[1];
      if (!ID.test(id ?? '')) return json(res, 404, { error: 'not-found' });
      if (parts.length === 2 && method === 'GET') {
        const detail = await encore.detail(id);
        return detail ? json(res, 200, detail) : json(res, 404, { error: 'not-found' });
      }
      if (parts.length === 2 && method === 'PUT') {
        const saved = encore.saveDraft(id, await readJson(req));
        return saved ? json(res, 200, await encore.detail(id)) : json(res, 404, { error: 'not-found' });
      }
      if (parts.length === 3 && parts[2] === 'publish' && method === 'POST') {
        const result = encore.publish(id);
        return json(res, result.ok ? 202 : result.status, result);
      }
      if (parts.length === 3 && parts[2] === 'remove' && method === 'POST') {
        const result = await encore.remove(id);
        return json(res, result.ok ? 200 : result.status, result);
      }
      if (parts.length === 3 && parts[2] === 'thumb' && method === 'GET') {
        const file = encore.thumb(id);
        if (!file) return json(res, 404, { error: 'not-found' });
        // Asked again every time, answered 304 while the file is the same: Pinchflat may replace it.
        const modified = (await stat(file)).mtime.toUTCString();
        const headers = { 'content-type': 'image/jpeg', 'cache-control': 'private, no-cache', 'last-modified': modified };
        if (req.headers['if-modified-since'] === modified) {
          res.writeHead(304, headers).end();
          return true;
        }
        res.writeHead(200, headers);
        createReadStream(file).on('error', () => res.destroy()).pipe(res);
        return true;
      }
      return json(res, 405, { error: 'method' });
    } catch (error) {
      if (error.status) return json(res, error.status, { error: error.message });
      throw error;
    }
  };
}
