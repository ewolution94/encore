// Every set brings its own colour: the thumbnail's most vivid hue, as OKLCH hue and chroma, which
// the page turns into its tint (app.css: --tint-h, --tint-c). Fermata's accentFromThumbnail
// (fermata/src/lib/image.ts), reading Encore's own /api/sets/<id>/thumb.

import { api } from './api.ts';

export interface Tint {
  h: number;
  c: number;
}

/** id → tint, or null for a thumbnail without a vivid colour (the page keeps Encore's own). */
export const tints = $state<Record<string, Tint | null>>({});
const asked = new Set<string>();

function toOklab(r: number, g: number, b: number) {
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** Pixels vote into hue buckets weighted by chroma, so a small vivid stage light beats a big dark crowd. */
async function measure(id: string): Promise<Tint | null> {
  const res = await fetch(api.thumb(id));
  if (!res.ok) return null;
  const bitmap = await createImageBitmap(await res.blob(), { resizeWidth: 64, resizeHeight: 36 });
  const canvas = new OffscreenCanvas(64, 36);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const { data } = ctx.getImageData(0, 0, 64, 36);
  const BUCKETS = 24;
  const buckets = Array.from({ length: BUCKETS }, () => ({ weight: 0, a: 0, b: 0, chroma: 0 }));
  for (let i = 0; i < data.length; i += 4) {
    const { L, a, b } = toOklab(data[i], data[i + 1], data[i + 2]);
    const chroma = Math.hypot(a, b);
    if (chroma < 0.05 || L < 0.25 || L > 0.95) continue;
    const hue = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
    const bucket = buckets[Math.floor(hue / (360 / BUCKETS))];
    const weight = chroma * chroma;
    bucket.weight += weight;
    bucket.a += a * weight;
    bucket.b += b * weight;
    bucket.chroma += chroma * weight;
  }
  const best = buckets.reduce((x, y) => (y.weight > x.weight ? y : x));
  if (best.weight < 0.05) return null;
  const h = Math.round(((Math.atan2(best.b, best.a) * 180) / Math.PI + 360) % 360);
  return { h, c: Math.min(0.19, Math.max(0.1, (best.chroma / best.weight) * 1.1)) };
}

/** Starts measuring a set's thumbnail once; `tints[id]` fills in when it's done. */
export function ensureTint(id: string) {
  if (asked.has(id)) return;
  asked.add(id);
  measure(id)
    .then((tint) => {
      tints[id] = tint;
    })
    .catch(() => {
      tints[id] = null;
    });
}

/** The style that hands a set's tint to everything inside an element; the element also needs the
 *  class `tinted`, so the colours made from it are made again there (app.css). */
export function tintStyle(id: string | null) {
  const tint = id ? tints[id] : null;
  return tint ? `--tint-h:${tint.h};--tint-c:${tint.c.toFixed(3)}` : '';
}
