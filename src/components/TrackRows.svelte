<script lang="ts">
  import { X } from '@lucide/svelte';
  import type { Issue, Track } from '../../shared/tracklist.mjs';
  import { t } from '../lib/i18n/index.svelte.ts';
  import { issueText } from '../lib/issues.ts';
  import TimeField from './TimeField.svelte';

  let {
    tracks,
    long,
    dj,
    issues,
    onedit,
    onremove,
  }: {
    tracks: Track[];
    long: boolean;
    dj: string;
    issues: Map<number, Issue[]>;
    onedit: (index: number, patch: Partial<Track>) => void;
    onremove: (index: number) => void;
  } = $props();
</script>

<ol class="rows">
  <li class="head" aria-hidden="true">
    <span>{t('rows.n')}</span>
    <span class="right">{t('rows.starts')}</span>
    <span>{t('rows.artist')}</span>
    <span>{t('rows.title')}</span>
    <span></span>
  </li>
  {#each tracks as track, i}
    {@const own = issues.get(i) ?? []}
    <li class="row" id={`track-${i}`} class:bad={own.some((x) => x.level === 'error')}>
      <span class="n mono">{i + 1}</span>
      <span class="time">
        <TimeField value={track.start} {long} label={t('rows.startOf', { n: i + 1 })} invalid={own.some((x) => ['order', 'same', 'end', 'trim', 'time'].includes(x.code))} onchange={(start) => onedit(i, { start })} />
      </span>
      <input class="field artist" value={track.artist} placeholder={dj || t('rows.artist')} aria-label={t('rows.artistOf', { n: i + 1 })} oninput={(e) => onedit(i, { artist: e.currentTarget.value })} />
      <input class="field title" class:invalid={own.some((x) => x.code === 'title')} value={track.title} placeholder={t('rows.title')} aria-label={t('rows.titleOf', { n: i + 1 })} oninput={(e) => onedit(i, { title: e.currentTarget.value })} />
      <button class="icon-button remove" aria-label={t('rows.remove', { n: i + 1 })} title={t('rows.removeShort')} onclick={() => onremove(i)}><X size={15} /></button>
      {#if own.length}
        <p class="issues">
          {#each own as issue}<span class:warn={issue.level === 'warn'}>{issueText(issue)}</span>{/each}
        </p>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .rows {
    display: grid;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row,
  .head {
    display: grid;
    grid-template-columns: 2.25rem 6.5rem minmax(0, 1fr) minmax(0, 1.4fr) 32px;
    gap: 6px;
    align-items: center;
  }

  .head {
    padding-bottom: 2px;
    font-size: var(--ewo-text-2xs);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ewo-fg-3);
  }

  .right {
    text-align: right;
    padding-right: 2px;
  }

  /* Track numbers in the tint, like a sleeve's. */
  .n {
    font-family: var(--ewo-sans);
    font-size: 13px;
    font-weight: 900;
    color: var(--tint);
    text-align: right;
    padding-right: 6px;
  }

  .artist {
    color: var(--ewo-fg-2);
  }

  .title {
    font-weight: 700;
  }

  .row {
    scroll-margin: 80px;
  }

  .row.bad .n {
    color: var(--ewo-bad);
  }

  .issues {
    grid-column: 3 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
    margin: -2px 0 4px;
    font-size: var(--ewo-text-xs);
    color: var(--ewo-bad);
  }

  .issues .warn {
    color: var(--ewo-warn);
  }

  /* A phone: number, time and remove on one line, artist and title below. */
  @media (max-width: 599px) {
    .head {
      display: none;
    }

    .row {
      grid-template-columns: 2rem 7rem minmax(0, 1fr) 32px;
      padding: 6px 0 8px;
      border-bottom: 1px solid var(--ewo-line);
    }

    .remove {
      grid-column: 4;
      grid-row: 1;
    }

    .artist,
    .title,
    .issues {
      grid-column: 2 / -1;
    }

    .issues {
      margin: 0;
    }
  }
</style>
