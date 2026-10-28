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

mount(App, { target: document.getElementById('app')! });
