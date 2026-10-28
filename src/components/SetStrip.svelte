<script lang="ts">
  import { formatTime, type Issue, type Track } from '../../shared/tracklist.mjs';

  // The whole set as one strip, every track a bar as long as it plays: a gap, a short track or one
  // out of place shows at a glance. Longer tracks are deeper in the tint, errors red, the trimmed
  // ends hatched. A click on a bar jumps to its row; the table stays the way to edit.
  let {
    tracks,
    duration,
    trimIn,
    trimOut,
    issues,
    onpick,
  }: { tracks: Track[]; duration: number; trimIn: number; trimOut: number | null; issues: Map<number, Issue[]>; onpick: (index: number) => void } = $props();

  const end = $derived(trimOut ?? duration);
  const pct = (seconds: number) => `${(Math.min(Math.max(seconds, 0), duration) / duration) * 100}%`;

  const bars = $derived.by(() => {
    const out: { index: number; from: number; to: number; bad: boolean; label: string }[] = [];
    tracks.forEach((track, index) => {
      if (track.start === null) return;
      const next = tracks.slice(index + 1).find((t) => t.start !== null);
      const from = index === 0 ? Math.max(trimIn, Math.min(track.start, trimIn)) : track.start;
      const to = Math.min(next?.start ?? end, end);
      const bad = (issues.get(index) ?? []).some((i) => i.level === 'error');
      const name = [track.artist, track.title].filter(Boolean).join(' – ');
      out.push({ index, from, to: Math.max(to, from + duration / 400), bad, label: `${index + 1} · ${name} · ${formatTime(track.start)}` });
    });
    return out;
  });

  const marks = $derived([0, 0.25, 0.5, 0.75].map((f) => f * duration));
</script>

<div class="strip" aria-hidden="true">
  <div class="bars">
    {#if trimIn > 0}<span class="trimmed" style:left="0" style:width={pct(trimIn)}></span>{/if}
    {#if end < duration}<span class="trimmed" style:left={pct(end)} style:width={pct(duration - end)}></span>{/if}
    {#each bars as bar (bar.index)}
      <!-- A mouse shortcut only: the strip is hidden from assistive tech, and the table is the way in. -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <span
        class="bar"
        class:bad={bar.bad}
        style:left={pct(bar.from)}
        style:width={pct(bar.to - bar.from)}
        style:--depth={`${Math.min(85, 22 + (bar.to - bar.from) / 4)}%`}
        title={bar.label}
        onclick={() => onpick(bar.index)}
        role="presentation"
      ></span>
    {/each}
    {#if !tracks.length}
      <span class="bar whole" style:left={pct(trimIn)} style:width={pct(end - trimIn)}></span>
    {/if}
  </div>
  <div class="ruler mono">
    {#each marks as mark}<span>{formatTime(mark)}</span>{/each}
    <span>{formatTime(duration)}</span>
  </div>
</div>

<style>
  .bars {
    position: relative;
    height: 12px;
  }

  .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    background: color-mix(in oklab, var(--tint) var(--depth, 40%), var(--ewo-bg));
    box-shadow: inset -2px 0 0 var(--ewo-bg);
    cursor: pointer;
    transition: background-color var(--ewo-dur-1) var(--ewo-ease);
  }

  .bar:hover {
    background: var(--tint);
  }

  .bar.bad {
    background: var(--ewo-bad);
  }

  .bar.whole {
    --depth: 55%;
    cursor: default;
  }

  .trimmed {
    position: absolute;
    top: 0;
    bottom: 0;
    background: repeating-linear-gradient(135deg, var(--ewo-line-strong) 0 1px, transparent 1px 5px);
  }

  .ruler {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: var(--ewo-text-2xs);
    color: var(--ewo-fg-3);
  }
</style>
