// Production server: the built page from ../dist, the API (api.mjs) and the scan of staging. No
// dependencies but ffmpeg on the PATH. Behind Cloudflare Access, which it checks itself.
//
//   PORT=8080 ENCORE_STAGING=/staging ENCORE_LIBRARY=/library ENCORE_DATA=/data node server/server.mjs
//
// The environment variables are in the README.

import http from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createAccess } from './access.mjs';
import { createApi } from './api.mjs';
import { createCensus } from './census.mjs';
import { createEncore } from './encore.mjs';
import { createTelegram } from './telegram.mjs';

const portFlag = process.argv.indexOf('--port');
const PORT = Number(portFlag > -1 ? process.argv[portFlag + 1] : (process.env.PORT ?? 8080));
const HOST = process.env.HOST ?? '0.0.0.0';
const DIST = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const env = process.env;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.txt']);
// What a browser may fetch without Access's cookie (iOS asks for home-screen icons without it).
const PUBLIC = /^\/(?:healthz|icons\/[\w.-]+|icon\.svg|favicon\.ico|manifest\.webmanifest|splash\/[\w.-]+)$/;

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'strict-transport-security': 'max-age=31536000',
  'referrer-policy': 'no-referrer',
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'x-robots-tag': 'noindex',
  'content-security-policy': [
    "default-src 'self'",
    "script-src 'self'",
    // Svelte's style="" attributes; the shared elements use constructable stylesheets.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join('; '),
};

const telegram = createTelegram({ token: env.ENCORE_TG_BOT_TOKEN, chatId: env.ENCORE_TG_CHAT_ID, publicUrl: env.ENCORE_PUBLIC_URL ?? 'https://encore.ewolution.cloud' });
const encore = createEncore({
  stagingDir: env.ENCORE_STAGING ?? '/staging',
  libraryDir: env.ENCORE_LIBRARY ?? '/library',
  dataDir: env.ENCORE_DATA ?? '/data',
  ffmpeg: env.ENCORE_FFMPEG ?? 'ffmpeg',
  telegram,
});
const api = createApi(encore);
const census = createCensus({ target: env.ENCORE_CENSUS ?? '', site: 'encore' });
const access = createAccess({ team: env.ENCORE_ACCESS_TEAM, aud: env.ENCORE_ACCESS_AUD });
// Encore publishes and deletes files in the synced folder: without Access it answers nothing but
// /healthz, unless it's asked to run open (locally, CI's smoke test: ENCORE_OPEN=1).
const open = env.ENCORE_OPEN === '1';
if (!access) console.warn(open ? 'Cloudflare Access is not checked (ENCORE_OPEN=1).' : 'Cloudflare Access is not set up (ENCORE_ACCESS_TEAM, ENCORE_ACCESS_AUD): refusing every request but /healthz.');
const compressed = new Map();

async function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const file = path.join(DIST, path.normalize(decoded));
  if (file !== DIST && !file.startsWith(DIST + path.sep)) return null;
  try {
    const info = await stat(file);
    if (info.isFile()) return { file, size: info.size, mtime: info.mtime };
  } catch {}
  return null;
}

async function serveStatic(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');
  let entry = await resolveFile(pathname);
  // One document: / and every path without an extension (/sets/<id>) get the page.
  if (!entry && !path.extname(pathname)) entry = await resolveFile('/index.html');
  if (!entry) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
    return;
  }
  const ext = path.extname(entry.file);
  const headers = {
    'content-type': MIME[ext] ?? 'application/octet-stream',
    'cache-control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    'last-modified': entry.mtime.toUTCString(),
  };
  const accept = req.headers['accept-encoding'] ?? '';
  const encoding = /\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : null;
  if (encoding && COMPRESSIBLE.has(ext) && entry.size < 8 * 1024 * 1024) {
    const key = `${entry.file}:${entry.mtime.getTime()}:${encoding}`;
    let body = compressed.get(key);
    if (!body) {
      const raw = await readFile(entry.file);
      body = encoding === 'br' ? zlib.brotliCompressSync(raw) : zlib.gzipSync(raw);
      compressed.set(key, body);
    }
    res.writeHead(200, { ...headers, 'content-encoding': encoding, 'content-length': body.length, vary: 'accept-encoding' });
    res.end(req.method === 'HEAD' ? undefined : body);
    return;
  }
  res.writeHead(200, { ...headers, 'content-length': entry.size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(entry.file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') {
    const ok = encore.healthy();
    return res.writeHead(ok ? 200 : 503, { 'content-type': 'text/plain' }).end(ok ? 'ok' : 'scan loop stalled');
  }
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);

  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (!PUBLIC.test(pathname)) {
      if (!access && !open) {
        res.writeHead(503, { 'content-type': 'text/plain' }).end('Encore is not protected yet: set ENCORE_ACCESS_TEAM and ENCORE_ACCESS_AUD.');
        return;
      }
      if (access && !(await access.check(req))) {
        res.writeHead(403, { 'content-type': 'text/plain' }).end('Sign in through encore.ewolution.cloud.');
        return;
      }
    }
    if (await census(req, res)) return;
    if (await api(req, res)) return;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end();
      return;
    }
    await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500).end('Internal error');
    else res.destroy();
  }
});

// Docker stops containers with SIGTERM, which Node ignores as PID 1 unless handled.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    encore.stop();
    server.close(() => process.exit(0));
    server.closeAllConnections();
    setTimeout(() => process.exit(0), 2000).unref();
  });
}

encore.start();
server.listen(PORT, HOST, () => {
  console.log(`Encore listening on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
