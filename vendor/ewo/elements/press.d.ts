export type PressPreset = 'calm' | 'lively';
/** Turns on tap feedback for the whole page. Call once, early (main.ts). */
export declare function pressFeedback(options?: {
    preset?: PressPreset;
}): void;
/**
 * Holds a control pressed (waiting.ts, while its action is pending), whatever the input was: a touch
 * that pressFeedback already marked stays pressed, a click or a key press gets the same look.
 */
export declare function holdPress(el: Element): void;
/** Lets a held control spring back (the preset's release: calm, or the games' bounce). */
export declare function releasePress(el: Element): void;
/** The look, shared with base.ts: tokens with a calm default and a lively preset for games. */
export declare const PRESS_CSS = "\n@layer ewo-press {\n  :root {\n    --ewo-press-scale: 0.96;\n    --ewo-press-scale-large: 0.985;\n    --ewo-press-opacity: 0.82;\n    --ewo-press-in: 70ms cubic-bezier(0.2, 0, 0, 1);\n    --ewo-press-out: 220ms cubic-bezier(0.2, 0, 0, 1);\n  }\n  /* The games' preset, as the user tuned it on Sch\u00E4tzle (2026-10-08: \"slightly\" less bouncy than\n     0.9 and an overshoot of 1.8). */\n  :root[data-ewo-press='lively'] {\n    --ewo-press-scale: 0.92;\n    --ewo-press-scale-large: 0.975;\n    --ewo-press-opacity: 0.9;\n    --ewo-press-out: 380ms cubic-bezier(0.34, 1.45, 0.5, 1);\n  }\n  /* !important on the transitions only: a control's own unlayered transition would otherwise win over\n     this layer, and the press then snapped instead of easing and bouncing back (Sch\u00E4tzle's buttons,\n     2026-10-08). A layered !important beats an unlayered normal declaration. They last only while\n     pressed or releasing. */\n  [data-pressed] {\n    transition: scale var(--ewo-press-in), opacity var(--ewo-press-in) !important;\n    opacity: var(--ewo-press-opacity);\n  }\n  [data-pressed='box'] { scale: var(--ewo-press-scale); }\n  [data-pressed='large'] { scale: var(--ewo-press-scale-large); }\n  [data-released] { transition: scale var(--ewo-press-out), opacity var(--ewo-press-out) !important; }\n  @media (prefers-reduced-motion: reduce) {\n    [data-pressed] { scale: none; }\n  }\n}\n";
