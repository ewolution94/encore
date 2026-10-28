export type Scale = {
    min: number;
    max: number;
    step: number;
};
/** The digits after the point a step needs: 0.5 → 1, 0.25 → 2, 1 → 0. */
export declare function decimals(step: number): number;
/** A usable scale from whatever the attributes said: max above min, a positive step. */
export declare function scaleOf(min: number, max: number, step: number): Scale;
/** The value on a step nearest to `v`, within the scale (a top that isn't on a step is never passed). */
export declare function snap(v: number, { min, max, step }: Scale): number;
/** Where a value sits, from 0 (min) to 1 (max). */
export declare function fractionOf(v: number, { min, max }: Scale): number;
/** The snapped value at a point `f` (0 to 1) along the rail. */
export declare function valueAt(f: number, scale: Scale): number;
/** How many steps the scale has (the gaps between ticks). */
export declare function stepCount({ min, max, step }: Scale): number;
/** PageUp and PageDown: a tenth of the range, at least one step, on a step. */
export declare function pageStep(scale: Scale): number;
