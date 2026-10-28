<!--
  Settings, the family's way (plans/settings-alignment.md): Folio's ewo-sheet with
  ewo-settings-basics (language, theme). Opens from the bar's settings button, or with `,`.
-->
<script lang="ts">
  import { prefs, ui, type Language } from '../lib/prefs.svelte.ts';
  import { theme, type ThemePreference } from '../lib/theme.svelte.ts';
  import { setLanguage, t } from '../lib/i18n/index.svelte.ts';

  // The content stays until the sheet's `close`, which fires after its exit animation.
  let shown = $state(false);
  $effect(() => {
    if (ui.settings) shown = true;
  });

  function closed() {
    shown = false;
    ui.settings = false;
  }
</script>

<ewo-sheet open={ui.settings} label={t('settings.title')} oncancel={() => (ui.settings = false)} onclose={closed}>
  <span slot="heading">{t('settings.title')}</span>
  {#if shown}
    <section>
      <h3 class="label">{t('settings.general')}</h3>
      <ewo-settings-basics
        language={prefs.language}
        theme={theme.preference}
        onlanguage-change={(e) => setLanguage(e.detail.value as Language)}
        ontheme-change={(e) => theme.set(e.detail.value as ThemePreference)}
      ></ewo-settings-basics>
    </section>
  {/if}
</ewo-sheet>

<style>
  section {
    display: grid;
    gap: 0.75rem;
  }
</style>
