export type WaitOptions = {
    /** What the control is doing, shown from 1.2 s: "Starting …". Without it, only the mark. */
    label?: string;
    /** From 6 s; defaults to "Taking longer …" in the page's language. */
    slow?: string;
    /** On a failure worth retrying; defaults to "Try again". */
    retry?: string;
    /** ms before giving up (default 12 s). */
    timeout?: number;
    /** Whether an error is worth "Try again" (default: timeouts, network failures, 5xx, `offline`/`busy`/`timeout` codes). */
    retryable?: (error: unknown) => boolean;
};
/** Thrown when the 12 s are up; `code` is `timeout` for an app's error words. */
export declare class WaitTimeout extends Error {
    readonly code = "timeout";
    constructor();
}
/** A game's own working mark: SVG or HTML markup, or a function that builds it. */
export declare function configureWaiting(options: {
    mark?: string | (() => Node);
}): void;
/** Whether an error deserves "Try again" rather than a shake. */
export declare function isRetryable(error: unknown): boolean;
/**
 * Runs `action` with the wait shown at `control` (any element; null runs it without a control).
 * Resolves with the action's result, or `undefined` when the control was already waiting (a second
 * tap); rejects with the action's error or a WaitTimeout.
 */
export declare function track<T>(control: Element | null | undefined, action: (signal: AbortSignal) => Promise<T>, options?: WaitOptions): Promise<T | undefined>;
/** The look, layered so an app's own rules win; `!important` only where a control's colour must yield. */
export declare const WAIT_CSS = "\n@layer ewo-wait {\n  /* While the overlay shows, the control's own label steps aside (text and children), keeping its size. */\n  [data-wait] { color: transparent !important; }\n  [data-wait] > :not(.ewo-wait) { visibility: hidden; }\n  .ewo-wait {\n    position: absolute;\n    inset: 0;\n    z-index: 1;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap: 0.45em;\n    padding: 0 0.6em;\n    border-radius: inherit;\n    color: var(--ewo-wait-fg, currentColor);\n    font: inherit;\n    line-height: 1.1;\n    white-space: nowrap;\n    pointer-events: none;\n    animation: ewo-wait-in 140ms ease-out;\n  }\n  .ewo-wait-text { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }\n  .ewo-wait-text:empty { display: none; }\n  /* Words too long for the control: a small bubble just under it. */\n  .ewo-wait[data-bubble] .ewo-wait-text {\n    position: absolute;\n    top: calc(100% + 6px);\n    left: 50%;\n    z-index: 5;\n    max-width: none;\n    translate: -50% 0;\n    padding: 4px 10px;\n    border-radius: 999px;\n    background: var(--ewo-wait-bubble-bg, var(--ewo-fg, #222));\n    color: var(--ewo-wait-bubble-fg, var(--ewo-bg, #fff));\n    font-size: 12px;\n    font-weight: 600;\n    line-height: 1.3;\n    letter-spacing: 0;\n    text-transform: none;\n    box-shadow: 0 6px 16px -8px rgb(0 0 0 / 0.5);\n    animation: ewo-wait-in 140ms ease-out;\n  }\n  .ewo-wait-retry { display: none; width: 1.1em; height: 1.1em; flex: none; }\n  .ewo-wait-retry svg { display: block; width: 100%; height: 100%; }\n  [data-wait='failed'] .ewo-wait-retry { display: block; }\n  .ewo-wait-mark { flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.2em; height: 1em; }\n  .ewo-wait-mark > span { display: inline-flex; align-items: center; gap: 0.2em; }\n  .ewo-wait-mark i { width: 0.3em; height: 0.3em; border-radius: 50%; background: currentColor; animation: ewo-wait-dot 900ms ease-in-out infinite; }\n  .ewo-wait-mark i:nth-child(2) { animation-delay: 150ms; }\n  .ewo-wait-mark i:nth-child(3) { animation-delay: 300ms; }\n  [data-wait='failed'] .ewo-wait-mark { display: none; }\n  [data-shake] { animation: ewo-wait-shake 380ms ease-in-out; }\n  .ewo-wait-live { position: fixed; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }\n  @keyframes ewo-wait-in { from { opacity: 0; } }\n  @keyframes ewo-wait-dot { 0%, 80%, 100% { opacity: 0.3; scale: 0.75; } 40% { opacity: 1; scale: 1; } }\n  @keyframes ewo-wait-shake { 20% { translate: -5px 0; } 40% { translate: 5px 0; } 60% { translate: -3px 0; } 80% { translate: 2px 0; } }\n  @media (prefers-reduced-motion: reduce) {\n    .ewo-wait-mark i { animation: none; opacity: 0.75; }\n    [data-shake] { animation: none; }\n    .ewo-wait { animation: none; }\n  }\n}\n";
