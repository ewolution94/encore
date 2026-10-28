import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
// @ts-expect-error: plain .mjs modules shared with the production server
import { createApi } from './server/api.mjs';
// @ts-expect-error: as above
import { createCensus } from './server/census.mjs';
// @ts-expect-error: as above
import { createEncore } from './server/encore.mjs';

// The dev server answers /api with the same code as production, against the fixtures in .dev
// (scripts/fixtures.mjs): staging as Pinchflat leaves it, a library folder standing in for the
// synced share, and Encore's own database. Telegram and Access stay off.
function appRoutes(): Plugin {
  let api: ((req: any, res: any) => Promise<boolean>) | undefined;
  const census = createCensus({ site: 'encore' });
  const ready = () => {
    if (api) return api;
    const encore = createEncore({
      stagingDir: process.env.ENCORE_STAGING ?? '.dev/staging',
      libraryDir: process.env.ENCORE_LIBRARY ?? '.dev/library',
      dataDir: process.env.ENCORE_DATA ?? '.dev/data',
      ffmpeg: process.env.ENCORE_FFMPEG ?? 'ffmpeg',
      scanEveryMs: 15_000,
    });
    encore.start();
    api = createApi(encore);
    return api;
  };
  const middleware = async (req: any, res: any, next: (error?: unknown) => void) => {
    try {
      if (await census(req, res)) return;
      if (await ready()(req, res)) return;
      next();
    } catch (error) {
      next(error);
    }
  };
  return {
    name: 'encore-routes',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

export default defineConfig({
  plugins: [svelte(), appRoutes()],
  // 7300 is the NAS port; locally the app runs beside it. 127.0.0.1, not localhost (IPv4 only).
  server: { host: '127.0.0.1', port: 7310, strictPort: true },
  preview: { host: '127.0.0.1', port: 7311, strictPort: true },
  build: {
    target: 'es2022',
    cssTarget: ['chrome123', 'safari17.5', 'firefox120'],
    // The CSP allows fonts from 'self' only, not data: (learnings/toolchain.md).
    assetsInlineLimit: 0,
  },
});
