// Cloudflare Access in front of encore.ewolution.cloud, checked here too: Access attaches a signed
// token to every request it lets through, so a request that skipped Cloudflare (the LAN port) has
// none and is refused. Census's server/src/auth.ts in plain JavaScript (learnings/cloudflare.md).
// Off without ENCORE_ACCESS_TEAM and ENCORE_ACCESS_AUD, which is only fine locally.

import { createPublicKey, verify } from 'node:crypto';
import { withDeadline } from './deadline.mjs';

export function createAccess({ team, aud, fetcher = fetch, now = Date.now, timeoutMs = 10_000 }) {
  if (!team || !aud) return null;
  const keys = new Map();
  let fetchedAt = 0;
  let pending;

  function refresh() {
    pending ??= (async () => {
      try {
        // On our own clock: every request with a key we don't know yet waits on this one.
        const list = await withDeadline(timeoutMs, async (signal) => {
          const res = await fetcher(`https://${team}/cdn-cgi/access/certs`, { signal });
          return res.ok ? (await res.json()).keys : undefined;
        });
        for (const jwk of list ?? []) {
          if (jwk.kty === 'RSA' && jwk.kid) keys.set(jwk.kid, createPublicKey({ key: { kty: 'RSA', n: jwk.n, e: jwk.e }, format: 'jwk' }));
        }
      } catch {
        // Cloudflare unreachable: requests are refused until it answers again.
      } finally {
        fetchedAt = now();
        pending = undefined;
      }
    })();
    return pending;
  }

  /** The signed-in email, or undefined for anything not signed by this team for this app. */
  async function check(token) {
    const [head, body, signature] = String(token ?? '').split('.');
    if (!head || !body || !signature) return undefined;
    let header;
    let claims;
    try {
      header = JSON.parse(Buffer.from(head, 'base64url').toString());
      claims = JSON.parse(Buffer.from(body, 'base64url').toString());
    } catch {
      return undefined;
    }
    if (header.alg !== 'RS256' || !header.kid) return undefined;
    let key = keys.get(header.kid);
    // Cloudflare rotates its keys; an unknown kid fetches them again, at most once a minute.
    if (!key && now() - fetchedAt > 60_000) {
      await refresh();
      key = keys.get(header.kid);
    }
    if (!key) return undefined;
    if (!verify('RSA-SHA256', Buffer.from(`${head}.${body}`), key, Buffer.from(signature, 'base64url'))) return undefined;
    const seconds = now() / 1000;
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(aud)) return undefined;
    if (claims.iss !== `https://${team}`) return undefined;
    if (typeof claims.exp !== 'number' || claims.exp < seconds - 30) return undefined;
    if (typeof claims.nbf === 'number' && claims.nbf > seconds + 30) return undefined;
    return claims.email ?? 'unknown';
  }

  return { check: (req) => check(req.headers['cf-access-jwt-assertion']) };
}
