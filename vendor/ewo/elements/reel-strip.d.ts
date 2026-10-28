/** One 32-bit word from the platform's crypto (the browser's, or Node's global webcrypto). */
export declare function cryptoWord(): number;
/**
 * A random integer in 0..n-1, exactly uniform: a word at or past the last full multiple of n is
 * drawn again, so every number owns as many of the 2^32 words. Scaling a word or a float, or taking
 * it modulo n, favours the low numbers (learnings/randomness.md in the workspace).
 */
export declare function fairInt(n: number, word?: () => number): number;
/**
 * A random index into a pool of `size`, never `previous` when there's anything else to draw:
 * "Again" should always land somewhere new. -1 for an empty pool; a `previous` outside the pool
 * (the pool got smaller) doesn't count. Without `random` it's a real draw, exact, from the platform's
 * crypto; a `random` float in [0, 1) is for seeded tests and the strip's filler rows.
 */
export declare function reelPick(size: number, previous?: number, random?: () => number): number;
/**
 * The strip a spin runs through: about `length` indices into a pool of `size`, ending on `target`,
 * never the same index twice in a row (the reel would look stuck). It starts at `from` when that's
 * given, so a spin continues from whatever the window showed last. The filler rows are decoration,
 * so Math.random will do; the target is drawn before, with reelPick.
 */
export declare function reelStrip(size: number, target: number, length: number, from?: number, random?: () => number): number[];
export type ReelMotionOptions = {
    /** The row in the middle of the window when the spin starts, and the one it lands on. */
    from: number;
    to: number;
    /** ms from the tap to the landing, without a tease (default 2100). */
    duration?: number;
    /** A near miss: stop one row short, strain at it for `hold` ms, then click over. */
    tease?: boolean;
    hold?: number;
};
/** The motion's fixed parts, in ms: the pull back before the run, the click over after a tease. */
export declare const REEL: {
    readonly pull: 140;
    readonly creep: 460;
    readonly hold: 1100;
    readonly duration: 2100;
};
/**
 * Where the reel stands `ms` into a spin, as a row index (fractional while it moves): a short
 * pull back, the run with an ease-out, a little past the last row and back onto it. With `tease`
 * (and at least two rows to run) it first stops one row short, strains at it, then clicks over
 * with a bounce. `total` is the whole spin in ms.
 */
export declare function reelMotion({ from, to, duration, tease, hold }: ReelMotionOptions): {
    total: number;
    at: (ms: number) => number;
    teasing: boolean;
};
