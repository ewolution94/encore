import './app.css';
// Look C, Sleeve: Libre Franklin for everything but the times (plans/encore.md).
import '@fontsource-variable/libre-franklin';
// Folio's shared elements (vendor/ewo, copied from PokeProxy's vendoring until Encore has a vendor
// target in Folio); each defines itself once.
import '../vendor/ewo/elements/segmented.js';
import '../vendor/ewo/elements/settings-basics.js';
import '../vendor/ewo/elements/settings-button.js';
import '../vendor/ewo/elements/sheet.js';
import '../vendor/ewo/elements/toaster.js';

import { mount } from 'svelte';
import App from './App.svelte';

// The app dispatches `splash:ready` itself, once the first list of sets is in (App.svelte).
const start = () => mount(App, { target: document.getElementById('app')! });

if (document.documentElement.classList.contains('splash')) {
  // Installed, the app opens on the splash screen (index.html, switched on by public/boot.js; written by
  // development/plans/splash-rollout). iOS fades its launch image into the page as soon as the page has
  // laid out, so the splash has to be on screen before the app's first render takes the main thread, or
  // the fade goes through a blank white web view.
  let started = false;
  const once = () => {
    if (started) return;
    started = true;
    start();
  };
  requestAnimationFrame(() => setTimeout(once));
  setTimeout(once, 100);
} else {
  start();
}

/**
 * The offline shell (see public/sw.js). Production only: a worker in front of the dev server
 * would cache the modules Vite is trying to hot-replace.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
