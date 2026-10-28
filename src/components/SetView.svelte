<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, ExternalLink, Plus } from '@lucide/svelte';
  import { toast } from '../../vendor/ewo/elements/toaster.js';
  import { checkTracks, formatTime, parseTracklist, type Issue, type Track } from '../../shared/tracklist.mjs';
  import { api, ApiError, type Draft, type SetDetail, type SetSummary, type Source } from '../lib/api.ts';
  import SetStrip from './SetStrip.svelte';
  import TimeField from './TimeField.svelte';
  import TrackRows from './TrackRows.svelte';

  let { id, summary, onback, onchange }: { id: string; summary: SetSummary | null; onback: () => void; onchange: () => void } = $props();

  let detail = $state<SetDetail | null>(null);
  let draft = $state<Draft | null>(null);
  let failed = $state(false);
  let pasteOpen = $state(false);
  let pasteText = $state('');
  let pasteError = $state('');

  // Saving: the page's draft is the truth while it's edited. Edits go out 500 ms after the last
  // one, one request at a time; what piled up meanwhile goes in the next.
  let pending: ReturnType<typeof setTimeout> | undefined;
  let saving: Promise<void> | null = null;
  let unsaved = false;

  async function load() {
    try {
      // Cloned before it becomes state: structuredClone refuses Svelte's proxies.
      const fresh = await api.set(id);
      detail = fresh;
      if (!unsaved) draft = structuredClone(fresh.draft);
      failed = false;
    } catch {
      failed = true;
    }
  }

  onMount(() => {
    void load();
    return () => {
      if (unsaved) void flush();
    };
  });

  // The list's view of this set changed under us (a publish finished or failed): read it again.
  let seen = '';
  $effect(() => {
    const key = summary ? `${summary.status}|${summary.publishedAt}|${summary.error}|${summary.job ? 1 : 0}|${summary.missing}` : '';
    if (seen && key !== seen && !summary?.job) void load();
    seen = key;
  });

  function edited() {
    unsaved = true;
    clearTimeout(pending);
    pending = setTimeout(() => void flush(), 500);
  }

  async function flush() {
    clearTimeout(pending);
    if (saving) await saving;
    if (!unsaved || !draft) return;
    unsaved = false;
    const sent = $state.snapshot(draft) as Draft;
    saving = api
      .save(id, sent)
      .then((fresh) => {
        if (detail) detail = { ...fresh, draft: detail.draft };
        onchange();
      })
      .catch(() => {
        unsaved = true;
        toast('Your changes weren’t saved. Encore can’t be reached.', { tone: 'bad' });
      })
      .finally(() => {
        saving = null;
      });
    await saving;
  }

  const long = $derived((detail?.duration ?? 0) >= 3600);
  const end = $derived(draft?.trimOut ?? detail?.duration ?? 0);
  const issues = $derived(draft && detail ? checkTracks(draft.tracks, { duration: detail.duration, trimIn: draft.trimIn, trimOut: draft.trimOut }) : []);
  const errors = $derived(issues.filter((i) => i.level === 'error'));
  const byIndex = $derived(
    issues.reduce((map, issue) => {
      if (issue.index >= 0) map.set(issue.index, [...(map.get(issue.index) ?? []), issue]);
      return map;
    }, new Map<number, Issue[]>()),
  );
  const setIssues = $derived(issues.filter((i) => i.index === -1));
  const job = $derived(summary?.job ?? null);
  const megabytes = $derived(Math.max(1, Math.round(((end - (draft?.trimIn ?? 0)) * 40_000) / 1e6)));
  const sourceKind = $derived(detail?.sources.find((s) => s.key === draft?.source)?.kind ?? (draft?.source === 'pasted' ? 'pasted' : null));

  const sameTracks = (a: Track[], b: Track[]) => JSON.stringify(a) === JSON.stringify(b);

  /** Replacing the tracklist asks first when the one there has been worked on. */
  function mayReplace() {
    if (!draft || !draft.tracks.length) return true;
    const from = detail?.sources.find((s) => s.key === draft!.source);
    if (from && sameTracks(from.tracks, $state.snapshot(draft.tracks) as Track[])) return true;
    return confirm('Replace the tracklist? Your changes to it will be lost.');
  }

  function useSource(source: Source) {
    if (!draft || draft.source === source.key || !mayReplace()) return;
    draft.tracks = $state.snapshot(source.tracks) as Track[];
    draft.source = source.key;
    pasteOpen = false;
    edited();
  }

  function usePaste() {
    if (!draft) return;
    const tracks = parseTracklist(pasteText);
    if (!tracks.length) {
      pasteError = 'No lines with a time in them. Each track needs one, like “12:34 Artist - Title”.';
      return;
    }
    if (!mayReplace()) return;
    draft.tracks = tracks;
    draft.source = 'pasted';
    pasteOpen = false;
    pasteText = '';
    pasteError = '';
    edited();
  }

  function editTrack(index: number, patch: Partial<Track>) {
    if (!draft) return;
    Object.assign(draft.tracks[index], patch);
    edited();
  }

  function removeTrack(index: number) {
    if (!draft) return;
    draft.tracks.splice(index, 1);
    edited();
  }

  /** From the strip: the track's row, scrolled into view, its title ready to type in. */
  function pick(index: number) {
    const row = document.getElementById(`track-${index}`);
    row?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    row?.querySelector<HTMLInputElement>('input.title')?.focus({ preventScroll: true });
  }

  function addTrack() {
    if (!draft || !detail) return;
    const last = draft.tracks.at(-1)?.start ?? draft.trimIn;
    draft.tracks.push({ start: draft.tracks.length ? Math.min(last + 60, Math.max(last, end - 1)) : draft.trimIn, artist: '', title: '' });
    edited();
  }

  async function publish() {
    await flush();
    try {
      await api.publish(id);
      onchange();
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) toast('Fix the marked tracks first.', { tone: 'bad' });
      else toast(error instanceof ApiError ? error.message : 'Encore can’t be reached.', { tone: 'bad' });
    }
  }

  async function remove() {
    if (!detail) return;
    const n = detail.files.length;
    if (!confirm(`Take ${n === 1 ? 'this set’s file' : `the ${n} tracks`} out of Spotify? The download and your tracklist stay here.`)) return;
    try {
      await api.remove(id);
      onchange();
      await load();
      toast('Removed. Drive takes it off the PC, and Spotify follows.');
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Encore can’t be reached.', { tone: 'bad' });
    }
  }

  const publishLabel = $derived(
    detail?.status === 'published' ? (summary?.changed ? 'Publish changes' : 'Published') : detail?.status === 'removed' ? 'Publish again' : 'Publish to Spotify',
  );
  const phaseLabel = { queued: 'Waiting for the one before', encoding: 'Encoding', cutting: 'Cutting into tracks', copying: 'Copying to the library' };
  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
</script>

<div class="view">
  {#if failed}
    <p class="note">This set can’t be loaded. <button class="button" onclick={load}>Try again</button></p>
  {:else if detail && draft}
    <div class="scroll">
      <div class="band" aria-hidden="true"></div>
      <header class="head">
        <button class="icon-button back" onclick={onback} aria-label="Back to the list"><ArrowLeft size={18} /></button>
        <span class="cover"><img src={api.thumb(id)} alt="" width="126" height="126" /></span>
        <div class="about">
          <h1>{detail.title}</h1>
          <p class="meta">
            {detail.channel} · <span class="mono">{formatTime(detail.duration)}</span> ·
            <a href={detail.url} target="_blank" rel="noreferrer">YouTube <ExternalLink size={12} /></a>
          </p>
          <p class="state">
            {#if detail.status === 'published'}
              In Spotify since {when(detail.publishedAt)}, {detail.files.length} {detail.files.length === 1 ? 'file' : 'tracks'}{summary?.changed ? '. Your changes aren’t published yet.' : '.'}
            {:else if detail.status === 'removed'}
              Taken out of Spotify. Publish it again any time.
            {:else}
              Waiting for you. Nothing reaches Spotify before you publish it.
            {/if}
          </p>
        </div>
      </header>

      <SetStrip tracks={draft.tracks} duration={detail.duration} trimIn={draft.trimIn} trimOut={draft.trimOut} issues={byIndex} onpick={pick} />

      {#if detail.missing}
        <p class="banner bad">The download is gone from staging, so this set can’t be published. Pinchflat’s page can download it again.</p>
      {/if}
      {#if detail.error && !job}
        <p class="banner bad">Publishing failed: {detail.error}</p>
      {/if}

      <section class="names">
        <label>
          <span class="label">Album</span>
          <input class="field" bind:value={draft.album} oninput={edited} />
        </label>
        <label>
          <span class="label">DJ</span>
          <input class="field" bind:value={draft.albumArtist} oninput={edited} />
        </label>
        <p class="hint">The album keeps the set together in Spotify; the DJ stands in for tracks without an artist.</p>
      </section>

      <section class="sources">
        <h2 class="label">Tracklist from</h2>
        <div class="chips" role="group" aria-label="Tracklist from">
          {#each detail.sources as source (source.key)}
            <button class="chip" class:on={draft.source === source.key} aria-pressed={draft.source === source.key} onclick={() => useSource(source)}>
              {source.label}
              <span class="mono count">{source.tracks.length}</span>
              {#if source.likes}<span class="likes">♥ {source.likes}</span>{/if}
            </button>
          {/each}
          <button class="chip" class:on={draft.source === 'pasted' || pasteOpen} aria-expanded={pasteOpen} onclick={() => (pasteOpen = !pasteOpen)}>Paste a list</button>
        </div>
        {#if !detail.sources.length}
          <p class="hint">Neither the description nor the top comments have a list with times. Paste one from 1001Tracklists or elsewhere, or add the tracks below.</p>
        {:else if sourceKind === 'chapters'}
          <p class="hint">YouTube writes these chapters itself. They’re rarely songs.</p>
        {/if}
        {#if pasteOpen}
          <div class="paste">
            <textarea class="field mono" rows="7" bind:value={pasteText} placeholder={'0:00 Artist - Title\n3:12 Artist - Title\n…'} aria-label="Tracklist to paste"></textarea>
            <div class="paste-row">
              {#if pasteError}<p class="error">{pasteError}</p>{/if}
              <button class="button" onclick={usePaste} disabled={!pasteText.trim()}>Use this list</button>
            </div>
          </div>
        {/if}
      </section>

      <section class="trim">
        <h2 class="label">The set runs</h2>
        <div class="trim-row">
          <span>from</span>
          <span class="trim-field"><TimeField value={draft.trimIn} {long} label="Set starts at" onchange={(v) => ((draft!.trimIn = v ?? 0), edited())} /></span>
          <span>to</span>
          <span class="trim-field"><TimeField value={draft.trimOut ?? detail.duration} {long} label="Set ends at" invalid={setIssues.length > 0} onchange={(v) => ((draft!.trimOut = v === null || v >= detail!.duration ? null : v), edited())} /></span>
          {#if draft.trimIn > 0 || draft.trimOut !== null}
            <button class="button quiet" onclick={() => ((draft!.trimIn = 0), (draft!.trimOut = null), edited())}>Whole video</button>
          {/if}
        </div>
        {#each setIssues as issue}<p class="error">{issue.message}</p>{/each}
      </section>

      <section class="tracks">
        <h2 class="label">Tracks <span class="mono count">{draft.tracks.length}</span></h2>
        {#if draft.tracks.length}
          <TrackRows tracks={draft.tracks} {long} dj={draft.albumArtist} issues={byIndex} onedit={editTrack} onremove={removeTrack} />
        {:else}
          <p class="hint">No tracks: the set goes to Spotify as one long track.</p>
        {/if}
        <button class="button quiet add" onclick={addTrack}><Plus size={15} /> Add a track</button>
      </section>
    </div>

    <footer class="actions">
      {#if job}
        <div class="progress" role="status">
          <span>{phaseLabel[job.phase]}{job.phase === 'queued' ? '' : ` ${Math.round(job.done * 100)}%`}</span>
          <span class="track"><span class="fill" style:transform={`scaleX(${job.phase === 'queued' ? 0 : job.done})`}></span></span>
        </div>
      {:else}
        <p class="sum">
          <span class="mono">{draft.tracks.length || 1}</span> {draft.tracks.length === 1 || !draft.tracks.length ? 'track' : 'tracks'} ·
          <span class="mono">{formatTime(end - draft.trimIn)}</span> · about {megabytes} MB
          {#if errors.length}<span class="to-fix">· {errors.length} to fix</span>{/if}
        </p>
        {#if detail.status === 'published'}
          <button class="button quiet danger" onclick={remove}>Remove from Spotify</button>
        {/if}
        <button class="button primary" onclick={publish} disabled={errors.length > 0 || detail.missing || (detail.status === 'published' && !summary?.changed)}>{publishLabel}</button>
      {/if}
    </footer>
  {/if}
</div>

<style>
  .view {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    height: 100%;
  }

  /* A grid with a gap, not margins between children: those wouldn't reach a child component's root
     (Svelte scopes the selector), and the strip is one. */
  .scroll {
    position: relative;
    display: grid;
    align-content: start;
    gap: var(--ewo-space-5);
    overflow-y: auto;
    padding: var(--ewo-space-6) var(--ewo-space-7) var(--ewo-space-6);
  }

  /* The set's colour washes in from the top, like light on a sleeve. */
  .band {
    position: absolute;
    inset: 0 0 auto;
    height: 220px;
    background: linear-gradient(180deg, var(--tint-wash), transparent);
    pointer-events: none;
  }


  .head {
    position: relative;
    display: grid;
    grid-template-columns: 126px minmax(0, 1fr);
    gap: var(--ewo-space-5);
    align-items: end;
  }


  .back {
    display: none;
  }

  .head .cover {
    width: 126px;
    height: 126px;
  }

  .about {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  h1 {
    font-size: 34px;
    line-height: 1.02;
    font-weight: 900;
    letter-spacing: -0.035em;
    text-wrap: balance;
    overflow-wrap: anywhere;
  }

  .meta {
    font-size: var(--ewo-text-sm);
    font-weight: 500;
    color: var(--ewo-fg-2);
  }

  .meta a {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .state {
    font-size: var(--ewo-text-sm);
    color: var(--ewo-fg-3);
  }

  .banner {
    padding: 10px 14px;
    border-left: 3px solid currentColor;
    font-size: var(--ewo-text-sm);
  }

  .banner.bad {
    background: color-mix(in oklab, var(--ewo-bad) 12%, transparent);
    color: var(--ewo-bad);
  }

  .names {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    gap: var(--ewo-space-2) var(--ewo-space-5);
  }

  .names label {
    display: grid;
    gap: 6px;
  }

  .names .hint {
    grid-column: 1 / -1;
  }

  .hint {
    font-size: var(--ewo-text-xs);
    color: var(--ewo-fg-3);
  }

  .error {
    font-size: var(--ewo-text-xs);
    color: var(--ewo-bad);
  }

  section > .label {
    margin-bottom: var(--ewo-space-2);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 18px;
  }

  /* Sources as the sleeve's credits: the chosen one underlined in the tint. */
  .chip {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    min-height: 32px;
    padding: 6px 1px 4px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    font-size: var(--ewo-text-sm);
    font-weight: 500;
    color: var(--ewo-fg-2);
  }

  .chip:hover {
    color: var(--ewo-fg);
    border-bottom-color: var(--ewo-line-strong);
  }

  .chip.on {
    color: var(--ewo-fg);
    font-weight: 700;
    border-bottom-color: var(--tint);
  }

  .count {
    font-size: var(--ewo-text-xs);
    opacity: 0.7;
  }

  .likes {
    font-size: var(--ewo-text-xs);
    opacity: 0.7;
  }

  .sources .hint {
    margin-top: var(--ewo-space-2);
  }

  .paste {
    display: grid;
    gap: var(--ewo-space-2);
    margin-top: var(--ewo-space-3);
  }

  textarea {
    resize: vertical;
    line-height: 1.45;
  }

  .paste-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ewo-space-3);
  }

  .paste-row .error {
    flex: 1;
  }

  .trim-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: var(--ewo-text-sm);
    color: var(--ewo-fg-2);
  }

  .trim-field {
    width: 7rem;
  }

  .tracks > .label {
    display: flex;
    gap: 8px;
  }

  .add {
    margin-top: var(--ewo-space-2);
    margin-left: 2rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--ewo-space-3);
    min-height: 64px;
    padding: 10px var(--ewo-space-6);
    border-top: 1px solid var(--ewo-line);
    background: var(--ewo-bg);
  }

  .sum {
    flex: 1;
    font-size: var(--ewo-text-sm);
    color: var(--ewo-fg-2);
  }

  .to-fix {
    color: var(--ewo-bad);
  }

  .progress {
    flex: 1;
    display: grid;
    gap: 6px;
    font-size: var(--ewo-text-sm);
  }

  .progress .track {
    height: 4px;
    overflow: hidden;
    background: var(--ewo-fill-2);
  }

  .fill {
    display: block;
    height: 100%;
    background: var(--tint);
    transform-origin: left;
    transition: transform 0.6s var(--ewo-ease);
  }

  .note {
    padding: var(--ewo-space-6);
    color: var(--ewo-fg-2);
  }

  @media (max-width: 899px) {
    .scroll {
      padding: var(--ewo-space-3) var(--ewo-space-4) var(--ewo-space-5);
    }

    /* The back arrow on its own line, then the cover beside the title. */
    .head {
      grid-template-columns: 96px minmax(0, 1fr);
      gap: var(--ewo-space-2) var(--ewo-space-4);
      align-items: start;
    }

    .back {
      display: inline-grid;
      grid-column: 1 / -1;
      margin-left: -8px;
    }

    .head .cover {
      width: 96px;
      height: 96px;
    }

    h1 {
      font-size: 24px;
    }

    .actions {
      flex-wrap: wrap;
      padding: 10px var(--ewo-space-4) max(10px, env(safe-area-inset-bottom));
    }

    .sum {
      flex-basis: 100%;
    }

    .actions .primary {
      margin-left: auto;
    }
  }

  @media (max-width: 599px) {
    .names {
      grid-template-columns: minmax(0, 1fr);
    }

    .add {
      margin-left: 0;
    }
  }
</style>
