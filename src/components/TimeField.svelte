<script lang="ts">
  import { formatTime, parseTime } from '../../shared/tracklist.mjs';

  // A time typed as people write it ("12:34", "1:02:03"). It reports a new value on Enter or when
  // it loses focus; while it's being typed in, the value from outside doesn't overwrite it.
  let {
    value,
    long = false,
    label,
    invalid = false,
    onchange,
  }: { value: number | null; long?: boolean; label: string; invalid?: boolean; onchange: (seconds: number | null) => void } = $props();

  let focused = $state(false);
  let text = $state('');
  let wrong = $state(false);

  $effect(() => {
    if (!focused) {
      text = value === null ? '' : formatTime(value, long);
      wrong = false;
    }
  });

  function commit() {
    const trimmed = text.trim();
    const seconds = trimmed === '' ? null : parseTime(trimmed);
    wrong = trimmed !== '' && seconds === null;
    if (!wrong && seconds !== value) onchange(seconds);
  }
</script>

<input
  class="field mono time"
  class:invalid={wrong || invalid}
  type="text"
  inputmode="numeric"
  autocomplete="off"
  spellcheck="false"
  aria-label={label}
  aria-invalid={wrong || invalid}
  placeholder={long ? '0:00:00' : '0:00'}
  bind:value={text}
  onfocus={() => (focused = true)}
  onblur={() => {
    focused = false;
    commit();
  }}
  onkeydown={(e) => {
    if (e.key === 'Enter') commit();
  }}
/>

<style>
  .time {
    text-align: right;
  }
</style>
