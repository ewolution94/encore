import './app.css';
// Folio's shared elements (vendor/ewo, copied from PokeProxy's vendoring until Encore has a vendor
// target in Folio); each defines itself once.
import '../vendor/ewo/elements/toaster.js';

import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
