// Types for @ewo/elements in Svelte 5 markup. Reference it once in an app:
//   /// <reference types="@ewo/elements/types/svelte" />
//
// Svelte sets a prop as a *property* when the element has one (value,
// options, ticks, checked, open), else as an attribute, and `onchange`
// listens for the element's own change event.

import type { HTMLAttributes } from 'svelte/elements';
import type { EwoBadge, EwoEmblem, EwoEmblemMaker, EwoEmpty, EwoGuide, EwoHalftone, EwoSegmented, EwoSettingsBasics, EwoSettingsButton, EwoSheet, EwoSkeleton, EwoSlotReel, EwoSlider, EwoConnection, EwoSwitch, EwoThemeToggle, EwoTicks, EwoToaster, LanguageChoice, SegmentedOption, SettingsThemeChoice, Tick } from './index';

type Handler<E, D> = (event: CustomEvent<D> & { currentTarget: E }) => void;

declare module 'svelte/elements' {
  interface SvelteHTMLElements {
    'ewo-segmented': Omit<HTMLAttributes<EwoSegmented>, 'onchange' | 'oninput'> & {
      value?: string;
      options?: SegmentedOption[];
      label?: string;
      name?: string;
      size?: 'md' | 'sm';
      tone?: 'neutral' | 'invert' | 'accent';
      stretch?: boolean;
      disabled?: boolean;
      onchange?: Handler<EwoSegmented, { value: string }>;
      oninput?: Handler<EwoSegmented, { value: string }>;
    };
    'ewo-slider': Omit<HTMLAttributes<EwoSlider>, 'onchange' | 'oninput'> & {
      value?: number;
      min?: number;
      max?: number;
      step?: number;
      mark?: number | null;
      label?: string;
      unit?: string;
      name?: string;
      ticks?: boolean;
      ends?: boolean;
      nobubble?: boolean;
      disabled?: boolean;
      format?: ((value: number) => string) | null;
      onchange?: Handler<EwoSlider, { value: number }>;
      oninput?: Handler<EwoSlider, { value: number }>;
    };
    'ewo-switch': Omit<HTMLAttributes<EwoSwitch>, 'onchange'> & {
      checked?: boolean;
      disabled?: boolean;
      row?: boolean;
      tone?: 'neutral' | 'accent';
      name?: string;
      value?: string;
      onchange?: Handler<EwoSwitch, { checked: boolean }>;
    };
    'ewo-badge': HTMLAttributes<EwoBadge> & {
      tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'unknown' | 'accent';
      variant?: 'outline' | 'soft' | 'plain';
      size?: 'md' | 'sm';
      pulse?: boolean;
      nodot?: boolean;
      live?: boolean;
    };
    'ewo-empty': HTMLAttributes<EwoEmpty> & { heading?: string; variant?: 'dashed' | 'solid'; tone?: 'neutral' | 'bad' | 'accent'; rings?: boolean; compact?: boolean };
    'ewo-skeleton': HTMLAttributes<EwoSkeleton> & { width?: string; height?: string; radius?: string; lines?: number };
    'ewo-ticks': HTMLAttributes<EwoTicks> & { ticks?: Tick[]; states?: string; label?: string; start?: string; end?: string };
    'ewo-toaster': HTMLAttributes<EwoToaster> & { position?: 'bottom' | 'top' };
    'ewo-connection': HTMLAttributes<EwoConnection> & { state?: 'connecting' | 'reconnecting' | 'online'; 'connecting-label'?: string; 'reconnecting-label'?: string; 'back-label'?: string };
    'ewo-sheet': Omit<HTMLAttributes<EwoSheet>, 'oncancel' | 'onclose'> & { open?: boolean; label?: string; wide?: boolean; placement?: 'center' | 'top'; oncancel?: Handler<EwoSheet, void>; onclose?: Handler<EwoSheet, void> };
    'ewo-guide': Omit<HTMLAttributes<EwoGuide>, 'oncancel' | 'onclose'> & { open?: boolean; label?: string; 'next-label'?: string; 'back-label'?: string; 'done-label'?: string; 'skip-label'?: string; oncancel?: Handler<EwoGuide, void>; onclose?: Handler<EwoGuide, void>; ondone?: Handler<EwoGuide, void>; onpage?: Handler<EwoGuide, { index: number }> };
    'ewo-slot-reel': HTMLAttributes<EwoSlotReel> & { rows?: 1 | 3 | '1' | '3'; rest?: number; ontick?: Handler<EwoSlotReel, { index: number }>; onland?: Handler<EwoSlotReel, { index: number }> };
    'ewo-theme-toggle': HTMLAttributes<EwoThemeToggle> & { cycle?: boolean; 'label-light'?: string; 'label-dark'?: string };
    'ewo-settings-button': HTMLAttributes<EwoSettingsButton> & { label?: string; 'show-label'?: boolean };
    'ewo-settings-basics': HTMLAttributes<EwoSettingsBasics> & {
      language?: LanguageChoice;
      theme?: SettingsThemeChoice;
      'language-label'?: string;
      'theme-label'?: string;
      'system-label'?: string;
      'light-label'?: string;
      'dark-label'?: string;
      'onlanguage-change'?: Handler<EwoSettingsBasics, { value: LanguageChoice }>;
      'ontheme-change'?: Handler<EwoSettingsBasics, { value: SettingsThemeChoice }>;
    };
    'ewo-emblem': HTMLAttributes<EwoEmblem> & {
      theme?: 'heraldry' | 'doodle' | 'token' | 'tag' | 'agent';
      value?: number[] | string;
      size?: number | string;
      mood?: '' | 'happy';
      crown?: boolean;
      boil?: boolean;
      ring?: boolean;
      dead?: boolean;
      label?: string;
      initial?: string;
    };
    'ewo-emblem-maker': Omit<HTMLAttributes<EwoEmblemMaker>, 'onchange'> & {
      theme?: 'heraldry' | 'doodle' | 'token' | 'tag' | 'agent';
      value?: number[] | string;
      initial?: string;
      onchange?: Handler<EwoEmblemMaker, { value: number[] }>;
    };
    'ewo-halftone': Omit<HTMLAttributes<EwoHalftone>, 'onload' | 'onerror'> & { src?: string; alt?: string; cell?: number; color?: 'ink' | 'photo'; fit?: 'cover' | 'contain'; lens?: boolean; ripple?: boolean; origin?: string };
  }
}

export {};
