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
// Two stage lights per set, so the page's tint and the covers' duotone have something to work on.
const lights = [
  ['0xff3ea5', '0x3a49ff'], ['0xffb21c', '0xff4f1c'], ['0x18e0c8', '0x1c64ff'], ['0xa24dff', '0xff2d55'],
  ['0xff2b2b', '0xff8a00'], ['0x1db954', '0x0b3d1f'], ['0xff7a1c', '0xffd51c'], ['0x1cd5ff', '0x6f3dff'],
];
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
    const [c0, c1] = lights[i % lights.length];
    // prettier-ignore
    await runFfmpeg(ffmpeg, [
      '-f', 'lavfi', '-i', `gradients=s=640x360:c0=${c0}:c1=${c1}:c2=0x08080c:nb_colors=3:seed=${i + 1}:speed=0`,
      '-vf', 'vignette=PI/3.2', '-frames:v', '1', thumb,
    ]);
  }
  // Last, so the dev server never sees a set whose audio isn't made yet.
  await copyFile(path.join(from, name), path.join(to, name));
}
console.log(`Staging ready: ${files.length} sets in ${path.relative(root, to)}`);
