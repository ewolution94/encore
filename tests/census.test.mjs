import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createCensus } from '../server/census.mjs';

// A stand-in for Census's ingest port, recording what the forwarder sends it.
let upstream;
let seen = [];

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${server.address().port}`)));
}

/** The app's side: the forwarder, and a 404 for anything it passes on. */
async function app(options) {
  const census = createCensus({ site: 'encore', ...options });
  const server = http.createServer(async (req, res) => {
    if (!(await census(req, res))) res.writeHead(404).end('not ours');
  });
  return { server, url: await listen(server) };
}

before(async () => {
  upstream = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      seen.push({ method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks).toString() });
      if (req.url === '/_e.js') {
        if (req.headers['if-none-match'] === '"b1"') return res.writeHead(304, { etag: '"b1"' }).end();
        return res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache', etag: '"b1"', 'x-internal': 'no' }).end('/* beacon */');
      }
      res.writeHead(204).end();
    });
  });
  upstream.url = await listen(upstream);
});

after(() => upstream.close());

test('passes the beacon through, with its caching headers and nothing else', async () => {
  seen = [];
  const { server, url } = await app({ target: upstream.url });
  const res = await fetch(`${url}/_e.js`);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), '/* beacon */');
  assert.equal(res.headers.get('etag'), '"b1"');
  assert.equal(res.headers.get('cache-control'), 'no-cache');
  assert.equal(res.headers.get('x-internal'), null);

  const again = await fetch(`${url}/_e.js`, { headers: { 'if-none-match': '"b1"' } });
  assert.equal(again.status, 304);
  server.close();
});

test('forwards a page view with the headers Census reads, and its own X-Site', async () => {
  seen = [];
  const { server, url } = await app({ target: upstream.url });
  const res = await fetch(`${url}/_e`, {
    method: 'POST',
    body: '{"t":"pv","p":"/elbe"}',
    headers: {
      'content-type': 'text/plain;charset=UTF-8',
      'user-agent': 'Mozilla/5.0 test',
      'cf-connecting-ip': '203.0.113.7',
      'cf-ipcountry': 'DE',
      'sec-gpc': '1',
      'x-site': 'landing',
      'x-forwarded-for': '198.51.100.1',
      cookie: 'a=b',
    },
  });
  assert.equal(res.status, 204);
  const [hit] = seen;
  assert.equal(hit.method, 'POST');
  assert.equal(hit.url, '/_e');
  assert.equal(hit.body, '{"t":"pv","p":"/elbe"}');
  assert.equal(hit.headers['x-site'], 'encore');
  assert.equal(hit.headers['user-agent'], 'Mozilla/5.0 test');
  assert.equal(hit.headers['cf-connecting-ip'], '203.0.113.7');
  assert.equal(hit.headers['cf-ipcountry'], 'DE');
  assert.equal(hit.headers['sec-gpc'], '1');
  assert.equal(hit.headers['x-forwarded-for'], '127.0.0.1');
  assert.equal(hit.headers.cookie, undefined);
  server.close();
});

test('refuses oversized bodies and wrong methods without calling Census', async () => {
  seen = [];
  const { server, url } = await app({ target: upstream.url });
  assert.equal((await fetch(`${url}/_e`, { method: 'POST', body: 'x'.repeat(5000) })).status, 413);
  assert.equal((await fetch(`${url}/_e`)).status, 405);
  assert.equal((await fetch(`${url}/_e.js`, { method: 'POST', body: '' })).status, 405);
  assert.equal(seen.length, 0);
  server.close();
});

test('leaves every other path alone', async () => {
  const { server, url } = await app({ target: upstream.url });
  for (const path of ['/', '/_e/x', '/_e.json', '/elbe']) {
    assert.equal(await (await fetch(`${url}${path}`)).text(), 'not ours', path);
  }
  server.close();
});

test('answers 502 when Census is unreachable', async () => {
  const { server, url } = await app({ target: 'http://127.0.0.1:9', timeout: 1000 });
  assert.equal((await fetch(`${url}/_e.js`)).status, 502);
  assert.equal((await fetch(`${url}/_e`, { method: 'POST', body: '{}' })).status, 502);
  server.close();
});

test('without a target: an empty beacon, and views go nowhere', async () => {
  seen = [];
  const { server, url } = await app({ target: '' });
  const res = await fetch(`${url}/_e.js`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /javascript/);
  assert.equal(await res.text(), '');
  assert.equal((await fetch(`${url}/_e`, { method: 'POST', body: '{}' })).status, 204);
  assert.equal(seen.length, 0);
  server.close();
});
