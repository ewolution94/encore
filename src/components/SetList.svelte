<script lang="ts">
  import { formatTime } from '../../shared/tracklist.mjs';
  import { api, type SetSummary } from '../lib/api.ts';
  import { tintStyle } from '../lib/tint.svelte.ts';

  let { sets, loaded, selected, onselect }: { sets: SetSummary[]; loaded: boolean; selected: string | null; onselect: (id: string) => void } = $props();

  const groups = $derived(
    [
      { key: 'waiting', label: 'Waiting for you', sets: sets.filter((s) => s.status === 'waiting') },
      { key: 'published', label: 'In Spotify', sets: sets.filter((s) => s.status === 'published').sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')) },
      { key: 'removed', label: 'Removed', sets: sets.filter((s) => s.status === 'removed') },
    ].filter((g) => g.sets.length),
  );

  function line(set: SetSummary) {
    if (set.job) return set.job.phase === 'queued' ? 'Queued' : `Publishing ${Math.round(set.job.done * 100)}%`;
    if (set.error) return 'Publishing failed';
    if (set.missing) return 'Download gone';
    if (set.status === 'published' && set.changed) return 'Changes not published';
    return set.trackCount ? `${set.trackCount} tracks` : 'No tracklist yet';
  }
</script>

{#if !loaded}
  <p class="empty">Loading…</p>
{:else if !sets.length}
  <div class="empty">
    <p>No sets yet.</p>
    <p class="sub">Save a set to the YouTube playlist; Pinchflat downloads it within half an hour.</p>
  </div>
{:else}
  {#each groups as group (group.key)}
    <section>
      <h2 class="group">{group.label}<span class="n">{group.sets.length}</span></h2>
      <ul>
        {#each group.sets as set (set.id)}
          <li>
            <button class="row tinted" class:active={set.id === selected} style={tintStyle(set.id)} aria-current={set.id === selected ? 'true' : undefined} onclick={() => onselect(set.id)}>
              <span class="cover"><img src={api.thumb(set.id)} alt="" width="54" height="54" loading="lazy" /></span>
              <span class="text">
                <span class="title">{set.album || set.title}</span>
                <span class="meta">
                  <span class="mono">{formatTime(set.duration)}</span>
                  <span class:alert={set.error || set.missing || set.changed} class:busy={set.job}>{line(set)}</span>
                </span>
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
{/if}

<style>
  section {
    padding: var(--ewo-space-4) 0 var(--ewo-space-2);
  }

  .group {
    display: flex;
    gap: 8px;
    padding: 0 var(--ewo-space-4) var(--ewo-space-2);
    font-size: var(--ewo-text-2xs);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ewo-fg-3);
  }

  .n {
    font-weight: 500;
  }

  ul {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 14px;
    align-items: center;
    width: 100%;
    padding: 8px var(--ewo-space-4);
    border: 0;
    background: transparent;
    text-align: left;
  }

  .row:hover {
    background: var(--ewo-fill);
  }

  .row.active {
    background: var(--ewo-bg);
    box-shadow: inset 3px 0 0 var(--tint);
  }

  .cover {
    width: 54px;
    height: 54px;
  }

  .text {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .title {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: var(--ewo-text-sm);
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.25;
  }

  .meta {
    display: flex;
    gap: 8px;
    font-size: var(--ewo-text-xs);
    color: var(--ewo-fg-3);
  }

  .alert {
    color: var(--ewo-warn);
  }

  .busy {
    color: var(--tint);
    font-weight: 600;
  }

  .empty {
    padding: var(--ewo-space-6) var(--ewo-space-4);
    color: var(--ewo-fg-2);
  }

  .sub {
    margin-top: var(--ewo-space-2);
    font-size: var(--ewo-text-sm);
    color: var(--ewo-fg-3);
  }
</style>
