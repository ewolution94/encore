// The forwarder for Census, the self-hosted visit counter (github.com/ewolution94/census).
// No dependencies.
//
// The browser loads /_e.js and posts page views to /_e on this origin, so the CSP stays 'self'.
// Both are passed through unchanged to the Census container over the NAS's shared Docker
// network (`ewolution`), with only the headers Census reads, plus X-Site naming this app. It
// computes nothing: the hashing and the opt-out and bot rules all live in Census.
//
// With no target configured (local runs), it answers with an empty beacon and accepts views
// without sending them anywhere, so nothing fails in the console and nothing is counted.

const FORWARDED = ['user-agent', 'cf-connecting-ip', 'cf-ipcountry', 'sec-gpc', 'dnt', 'content-type', 'if-none-match'];
const RETURNED = ['content-type', 'cache-control', 'etag', 'x-content-type-options'];
/** A page view is well under 1 KB; Census refuses more than that anyway. */
const MAX_BODY = 2048;

/**
 * @param {{ target?: string, site: string, timeout?: number }} options
 *   target  Census's ingest origin, e.g. http://census:4901; empty turns forwarding off
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<boolean>}
 *   true when the request was one of ours and has been answered
 */
export function createCensus({ target, site, timeout = 5000 }) {
  return async function census(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname !== '/_e' && pathname !== '/_e.js') return false;

    const script = pathname === '/_e.js';
    if (script ? req.method !== 'GET' && req.method !== 'HEAD' : req.method !== 'POST') {
      res.writeHead(405).end();
      return true;
    }

    let body;
    if (!script) {
      body = await readBody(req, MAX_BODY);
      if (body === null) {
        res.writeHead(413).end();
        return true;
      }
    }

    if (!target) {
      if (script) res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache' }).end();
      else res.writeHead(204).end();
      return true;
    }

    // The visitor's address: Cloudflare's header when it's there; Census falls back to this one
    // for a visit over the LAN. Whatever the client sent as X-Forwarded-For or X-Site is dropped.
    const headers = { 'x-site': site, 'x-forwarded-for': (req.socket.remoteAddress ?? '').replace(/^::ffff:/, '') };
    for (const name of FORWARDED) {
      const value = req.headers[name];
      if (typeof value === 'string') headers[name] = value;
    }

    try {
      const upstream = await fetch(new URL(pathname, target), {
        method: req.method,
        headers,
        body,
        signal: AbortSignal.timeout(timeout),
      });
      const out = {};
      for (const name of RETURNED) {
        const value = upstream.headers.get(name);
        if (value) out[name] = value;
      }
      const payload = req.method === 'HEAD' ? undefined : Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, out).end(payload);
    } catch {
      // Census down, or not on the network yet: the beacon gives up quietly, the page doesn't care.
      if (!res.headersSent) res.writeHead(502).end();
    }
    return true;
  };
}

/** The whole body, or null once it passes `limit` bytes. */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        req.removeAllListeners('data');
        req.resume();
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
