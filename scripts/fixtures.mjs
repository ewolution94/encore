// A staging folder for the dev server, the way Pinchflat leaves one: `.dev/staging/<id>.opus`,
// `<id>.info.json`, `<id>-thumb.jpg`. The info JSON is real (tests/fixtures/info: the description,
// chapters and top comments of sets Pinchflat downloaded); the audio and thumbnails are made here,
// a tone that steps up every 30 s, so no one's music ends up in the repo. Files already made stay.
//
//   node scripts/fixtures.mjs

import { copyFile, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFfmpeg } from '../server/ffmpeg.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const from = path.join(root, 'tests/fixtures/info');
const to = path.join(root, '.dev/staging');
const ffmpeg = process.env.ENCORE_FFMPEG ?? 'ffmpeg';
const exists = (file) => stat(file).then(() => true, () => false);

await mkdir(to, { recursive: true });
const hues = ['0x334155', '0x7c2d12', '0x14532d', '0x1e3a8a', '0x581c87', '0x713f12', '0x134e4a', '0x831843'];
const files = (await readdir(from)).filter((f) => f.endsWith('.info.json')).sort();
for (const [i, name] of files.entries()) {
  const id = name.replace(/\.info\.json$/, '');
  const { duration } = JSON.parse(await readFile(path.join(from, name), 'utf8'));
  const audio = path.join(to, `${id}.opus`);
  if (!(await exists(audio))) {
    process.stdout.write(`Making ${id}.opus (${Math.round(duration / 60)} min)… `);
    // prettier-ignore
    await runFfmpeg(ffmpeg, [
      '-f', 'lavfi', '-i', `aevalsrc=0.2*sin(2*PI*(196+49*mod(floor(t/30)\\,8))*t):s=24000:d=${duration}`,
      '-c:a', 'libopus', '-b:a', '12k', audio,
    ]);
    console.log('done');
  }
  const thumb = path.join(to, `${id}-thumb.jpg`);
  if (!(await exists(thumb))) {
    await runFfmpeg(ffmpeg, ['-f', 'lavfi', '-i', `color=c=${hues[i % hues.length]}:s=640x360:d=1`, '-frames:v', '1', thumb]);
  }
  // Last, so the dev server never sees a set whose audio isn't made yet.
  await copyFile(path.join(from, name), path.join(to, name));
}
console.log(`Staging ready: ${files.length} sets in ${path.relative(root, to)}`);
