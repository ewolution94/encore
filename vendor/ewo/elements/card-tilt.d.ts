/**
 * Call inside the gesture that opens a card big: iOS only shows its prompt from a user gesture. It
 * asks once per visit; the answer holds for the cards after.
 */
export declare function askTilt(): void;
export interface TiltOptions {
    /** The most it tips either way, in degrees (16). */
    max?: number;
    /** The perspective, in px (900). */
    perspective?: number;
}
/** Tilts `node` (a card's wrapper) and its `.glare` and `.foil`; returns `{ destroy }` (a Svelte action as it is). */
export declare function tilt(node: HTMLElement, options?: TiltOptions): {
    destroy(): void;
};
