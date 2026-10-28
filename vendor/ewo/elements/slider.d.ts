import { EwoElement } from './base';
import { type Scale } from './slider-scale';
/**
 * A range slider: smooth to drag, snapping to its step, with an optional mark (e.g. the default),
 * ticks, end captions and a value bubble.
 *
 * @tagname ewo-slider
 * @attr {number} value - The current value (snapped to the step, within min and max).
 * @attr {number} min - Default 0.
 * @attr {number} max - Default 100.
 * @attr {number} step - Default 1; decimals are kept exact (0.5, 0.25).
 * @attr {number} mark - A value to mark under the rail, e.g. the default.
 * @attr {string} label - Accessible name.
 * @attr {string} unit - Appended to the value in the bubble, the ends and aria-valuetext ("5 s").
 * @attr {string} name - Form field name.
 * @attr {boolean} ticks - A dot per step on the rail (up to 100 steps).
 * @attr {boolean} ends - The min and max captioned under the rail.
 * @attr {boolean} nobubble - No value bubble over the knob.
 * @attr {boolean} disabled
 * @prop {((value: number) => string) | null} format - Writes a value (bubble, ends, aria-valuetext); default: the page's language plus `unit`.
 * @fires input - `detail: { value }` while dragging, each time the value reaches another step.
 * @fires change - `detail: { value }` once the user lets go (or for each key press), if the value changed.
 * @cssprop [--ewo-slider-knob-size=22px]
 * @cssprop [--ewo-slider-track-height=6px]
 * @cssprop [--ewo-slider-fill=var(--ewo-accent)] - The rail up to the knob.
 * @cssprop [--ewo-slider-track=var(--ewo-fill-3)] - The rest of the rail.
 * @cssprop [--ewo-slider-track-shadow=none]
 * @cssprop [--ewo-slider-knob=var(--ewo-bg-raised)] - The knob's background (a colour or a gradient).
 * @cssprop --ewo-slider-knob-shadow - The knob's ring and shadow.
 * @cssprop [--ewo-slider-tick=currentColor at 28%]
 * @cssprop [--ewo-slider-mark=var(--ewo-fg-3)] - The mark's colour.
 * @cssprop [--ewo-slider-bubble=var(--ewo-invert)] - The bubble's background.
 * @cssprop [--ewo-slider-bubble-ink=var(--ewo-invert-ink)]
 * @csspart rail - The hit area.
 * @csspart track - The rail's bar.
 * @csspart fill - The filled part of the bar.
 * @csspart ticks
 * @csspart mark
 * @csspart knob
 * @csspart bubble
 * @csspart ends - The min and max captions.
 */
export declare class EwoSlider extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static formAssociated: boolean;
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    get scale(): Scale;
    get value(): number;
    set value(v: number | string);
    get min(): number;
    set min(v: number);
    get max(): number;
    set max(v: number);
    get step(): number;
    set step(v: number);
    /** A value marked under the rail (the default, say), or null. */
    get mark(): number | null;
    set mark(v: number | null);
    get label(): string;
    set label(v: string);
    get disabled(): boolean;
    set disabled(v: boolean);
    /** Writes a value for the bubble, the ends and aria-valuetext; null for the page's language plus `unit`. */
    get format(): ((value: number) => string) | null;
    set format(fn: ((value: number) => string) | null);
    formResetCallback(): void;
    /** The value as written for people. */
    text(v?: number): string;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-slider': EwoSlider;
    }
}
