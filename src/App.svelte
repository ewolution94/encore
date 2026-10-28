<script lang="ts">
  import { onMount } from 'svelte';
  import { RefreshCw } from '@lucide/svelte';
  import { toast } from '../vendor/ewo/elements/toaster.js';
  import { api, type SetSummary } from './lib/api.ts';
  import { loadCensus } from './lib/census.ts';
  import { t, tn } from './lib/i18n/index.svelte.ts';
  import { ui } from './lib/prefs.svelte.ts';
  import { ensureTint, tintStyle } from './lib/tint.svelte.ts';
  import SetList from './components/SetList.svelte';
  import SetView from './components/SetView.svelte';
  import Settings from './components/Settings.svelte';

  const idFromPath = () => /^\/sets\/([\w-]{11})$/.exec(location.pathname)?.[1] ?? null;

  let sets = $state<SetSummary[]>([]);
  let loaded = $state(false);
  let offline = $state(false);
  let scanning = $state(false);
  let selected = $state<string | null>(idFromPath());

  const summary = $derived(sets.find((s) => s.id === selected) ?? null);
  const waiting = $derived(sets.filter((s) => s.status === 'waiting').length);

  // Every cover is tinted with its own set's colour, and the open set tints the page.
  $effect(() => {
    for (const set of sets) ensureTint(set.id);
  });

  function select(id: string | null) {
    if (id === selected) return;
    selected = id;
    history.pushState(null, '', id ? `/sets/${id}` : '/');
  }

  async function refresh() {
    try {
      sets = await api.sets();
      loaded = true;
      offline = false;
    } catch {
      offline = true;
    }
  }

  async function scan() {
    scanning = true;
    try {
      const { found } = await api.scan();
      await refresh();
      toast(found ? tn('app.found', found) : t('app.nothingNew'));
    } catch {
      toast(t('app.unreachable'), { tone: 'bad' });
    } finally {
      scanning = false;
    }
  }

  onMount(() => {
    const onPop = () => (selected = idFromPath());
    addEventListener('popstate', onPop);
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    // Faster while something is publishing, so its progress moves.
    const poll = async () => {
      await refresh();
      // Counted once the first route has settled (a wide screen opens a set by itself, below).
      queueMicrotask(loadCensus);
      if (stopped) return;
      timer = setTimeout(poll, sets.some((s) => s.job) ? 1000 : 5000);
    };
    void poll();
    // `,` opens the settings, as in the other apps, unless the key is being typed into a field.
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== ',' || e.metaKey || e.ctrlKey || e.altKey || target.closest('input, textarea, [contenteditable]')) return;
      e.preventDefault();
      ui.settings = true;
    };
    addEventListener('keydown', onKey);
    return () => {
      stopped = true;
      clearTimeout(timer);
      removeEventListener('popstate', onPop);
      removeEventListener('keydown', onKey);
    };
  });

  // On a wide screen the newest set waiting opens by itself; a phone starts on the list.
  $effect(() => {
    if (selected || !loaded || !sets.length || !matchMedia('(min-width: 900px)').matches) return;
    selected = (sets.find((s) => s.status === 'waiting') ?? sets[0]).id;
    history.replaceState(null, '', `/sets/${selected}`);
  });
</script>

<div class="app tinted" class:open={selected !== null} style={tintStyle(selected)}>
  <header class="bar">
    <a class="brand" href="/" aria-label={t('app.home')} onclick={(e) => (e.preventDefault(), select(null))}>Encore<span class="dot">.</span></a>
    {#if loaded}
      <span class="count mono">{t('app.waiting', { count: waiting })}</span>
    {/if}
    <span class="spacer"></span>
    {#if offline}
      <span class="offline">{t('app.offline')}</span>
    {/if}
    <button class="button quiet" onclick={scan} disabled={scanning} title={t('app.scanTitle')}>
      <RefreshCw size={15} class={scanning ? 'spin' : ''} />
      <span class="scan-label">{t('app.scan')}</span>
    </button>
    <!-- Its own <button> inside takes the keys and names itself (after <html lang>); the click bubbles out. -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <ewo-settings-button onclick={() => (ui.settings = true)}></ewo-settings-button>
  </header>

  <aside class="list-pane" aria-label={t('list.label')}>
    <SetList {sets} {loaded} {selected} onselect={select} />
  </aside>

  <main class="detail-pane">
    {#if selected}
      {#key selected}
        <SetView id={selected} {summary} onback={() => select(null)} onchange={refresh} />
      {/key}
    {:else if loaded && sets.length}
      <p class="hint">{t('app.pick')}</p>
    {/if}
  </main>
</div>

<Settings />

<style>
  .app {
    --bar: 52px;
    --list: 360px;
    display: grid;
    grid-template-columns: var(--list) minmax(0, 1fr);
    grid-template-rows: var(--bar) minmax(0, 1fr);
    height: 100dvh;
  }

  .bar {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: var(--ewo-space-3);
    padding: 0 var(--ewo-space-3) 0 var(--ewo-space-4);
    border-bottom: 1px solid var(--ewo-line);
    background: var(--ewo-bg);
  }

  .brand {
    font-weight: 900;
    font-size: 21px;
    letter-spacing: -0.035em;
    text-decoration: none;
  }

  .dot {
    color: var(--tint);
    transition: color var(--ewo-dur-3) var(--ewo-ease);
  }

  .count {
    font-size: var(--ewo-text-xs);
    color: var(--ewo-fg-3);
  }

  .spacer {
    flex: 1;
  }

  .offline {
    font-size: var(--ewo-text-xs);
    color: var(--ewo-bad);
  }

  .bar :global(.spin) {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      rotate: 1turn;
    }
  }

  .list-pane {
    min-height: 0;
    overflow-y: auto;
    border-right: 1px solid var(--ewo-line);
    background: var(--ewo-bg-sunk);
  }

  .detail-pane {
    min-height: 0;
    min-width: 0;
  }

  .hint {
    padding: var(--ewo-space-6);
    color: var(--ewo-fg-3);
  }

  /* A phone: the list, or the open set over it. */
  @media (max-width: 899px) {
    .app {
      grid-template-columns: minmax(0, 1fr);
    }

    .app.open .list-pane,
    .app:not(.open) .detail-pane {
      display: none;
    }

    .list-pane {
      border-right: 0;
    }

    .scan-label {
      display: none;
    }
  }
</style>
