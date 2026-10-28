<script lang="ts">
  import { onMount } from 'svelte';
  import { RefreshCw } from '@lucide/svelte';
  import { toast } from '../vendor/ewo/elements/toaster.js';
  import { api, type SetSummary } from './lib/api.ts';
  import { ensureTint, tintStyle } from './lib/tint.svelte.ts';
  import SetList from './components/SetList.svelte';
  import SetView from './components/SetView.svelte';

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
      toast(found ? `${found} new ${found === 1 ? 'set' : 'sets'} found.` : 'Nothing new in staging.');
    } catch {
      toast('Encore can’t be reached.', { tone: 'bad' });
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
      if (stopped) return;
      timer = setTimeout(poll, sets.some((s) => s.job) ? 1000 : 5000);
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
      removeEventListener('popstate', onPop);
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
    <a class="brand" href="/" onclick={(e) => (e.preventDefault(), select(null))}>Encore<span class="dot">.</span></a>
    {#if loaded}
      <span class="count mono">{waiting} waiting</span>
    {/if}
    <span class="spacer"></span>
    {#if offline}
      <span class="offline">Can’t reach Encore</span>
    {/if}
    <button class="button quiet" onclick={scan} disabled={scanning} title="Look for new downloads now">
      <RefreshCw size={15} class={scanning ? 'spin' : ''} />
      <span class="scan-label">Check for new sets</span>
    </button>
  </header>

  <aside class="list-pane" aria-label="Sets">
    <SetList {sets} {loaded} {selected} onselect={select} />
  </aside>

  <main class="detail-pane">
    {#if selected}
      {#key selected}
        <SetView id={selected} {summary} onback={() => select(null)} onchange={refresh} />
      {/key}
    {:else if loaded && sets.length}
      <p class="hint">Pick a set to check its tracks.</p>
    {/if}
  </main>
</div>

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
