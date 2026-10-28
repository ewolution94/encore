// JSX types for @ewo/elements in React 19. Reference it once in an app:
//   /// <reference types="@ewo/elements/types/react" />
//
// React 19 sets a prop as a *property* when the element has one (value,
// options, ticks, checked, open) and as an attribute otherwise. Lower-case
// `on<event>` props become addEventListener(<event>) on custom elements, so
// `onchange` receives the element's own CustomEvent with its detail.
//
// Hand-written for the MVP; a generator (custom-element-jsx-integration)
// can produce this from custom-elements.json.

import type { DOMAttributes, HTMLAttributes, Key, Ref } from 'react';
import type { EwoBadge, EwoEmblem, EwoEmblemMaker, EwoEmpty, EwoGuide, EwoHalftone, EwoSegmented, EwoSettingsBasics, EwoSettingsButton, EwoSheet, EwoSkeleton, EwoSlotReel, EwoSlider, EwoConnection, EwoSwitch, EwoThemeToggle, EwoTicks, EwoToaster, LanguageChoice, SegmentedOption, SettingsThemeChoice, Tick } from './index';

type Base<E> = Omit<HTMLAttributes<E>, 'onChange' | 'onInput' | 'onLoad' | 'onError' | 'onCancel' | 'onClose'> &
  Pick<DOMAttributes<E>, 'children'> & {
    ref?: Ref<E>;
    key?: Key;
    class?: string;
    slot?: string;
  };

type Handler<D> = (event: CustomEvent<D>) => void;

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ewo-segmented': Base<EwoSegmented> & {
        value?: string;
        options?: SegmentedOption[];
        label?: string;
        name?: string;
        size?: 'md' | 'sm';
        tone?: 'neutral' | 'invert' | 'accent';
        stretch?: boolean;
        disabled?: boolean;
        onchange?: Handler<{ value: string }>;
        oninput?: Handler<{ value: string }>;
      };
      'ewo-slider': Base<EwoSlider> & {
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
        onchange?: Handler<{ value: number }>;
        oninput?: Handler<{ value: number }>;
      };
      'ewo-switch': Base<EwoSwitch> & {
        checked?: boolean;
        disabled?: boolean;
        row?: boolean;
        tone?: 'neutral' | 'accent';
        name?: string;
        value?: string;
        onchange?: Handler<{ checked: boolean }>;
      };
      'ewo-emblem': Base<EwoEmblem> & {
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
      'ewo-emblem-maker': Base<EwoEmblemMaker> & {
        theme?: 'heraldry' | 'doodle' | 'token' | 'tag' | 'agent';
        value?: number[] | string;
        initial?: string;
        onchange?: Handler<{ value: number[] }>;
      };
      'ewo-badge': Base<EwoBadge> & {
        tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'unknown' | 'accent';
        variant?: 'outline' | 'soft' | 'plain';
        size?: 'md' | 'sm';
        pulse?: boolean;
        nodot?: boolean;
        live?: boolean;
      };
      'ewo-empty': Base<EwoEmpty> & { heading?: string; variant?: 'dashed' | 'solid'; tone?: 'neutral' | 'bad' | 'accent'; rings?: boolean; compact?: boolean };
      'ewo-skeleton': Base<EwoSkeleton> & { width?: string; height?: string; radius?: string; lines?: number };
      'ewo-ticks': Base<EwoTicks> & { ticks?: Tick[]; states?: string; label?: string; start?: string; end?: string };
      'ewo-toaster': Base<EwoToaster> & { position?: 'bottom' | 'top' };
      'ewo-connection': Base<EwoConnection> & { state?: 'connecting' | 'reconnecting' | 'online'; 'connecting-label'?: string; 'reconnecting-label'?: string; 'back-label'?: string };
      'ewo-sheet': Base<EwoSheet> & { open?: boolean; label?: string; wide?: boolean; placement?: 'center' | 'top'; oncancel?: Handler<void>; onclose?: Handler<void> };
      'ewo-guide': Base<EwoGuide> & { open?: boolean; label?: string; 'next-label'?: string; 'back-label'?: string; 'done-label'?: string; 'skip-label'?: string; oncancel?: Handler<void>; onclose?: Handler<void>; ondone?: Handler<void>; onpage?: Handler<{ index: number }> };
      'ewo-slot-reel': Base<EwoSlotReel> & { rows?: 1 | 3 | '1' | '3'; rest?: number; ontick?: Handler<{ index: number }>; onland?: Handler<{ index: number }> };
      'ewo-theme-toggle': Base<EwoThemeToggle> & { cycle?: boolean; 'label-light'?: string; 'label-dark'?: string };
      'ewo-settings-button': Base<EwoSettingsButton> & { label?: string; 'show-label'?: boolean };
      'ewo-settings-basics': Base<EwoSettingsBasics> & {
        language?: LanguageChoice;
        theme?: SettingsThemeChoice;
        'language-label'?: string;
        'theme-label'?: string;
        'system-label'?: string;
        'light-label'?: string;
        'dark-label'?: string;
        'onlanguage-change'?: Handler<{ value: LanguageChoice }>;
        'ontheme-change'?: Handler<{ value: SettingsThemeChoice }>;
      };
      'ewo-halftone': Base<EwoHalftone> & { src?: string; alt?: string; cell?: number; color?: 'ink' | 'photo'; fit?: 'cover' | 'contain'; lens?: boolean; ripple?: boolean; origin?: string };
    }
  }
}
