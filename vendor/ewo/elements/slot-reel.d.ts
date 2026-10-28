import { EwoElement } from './base';
export type SpinOptions = {
    /** ms from the tap to the landing, without a tease (default 2100). */
    duration?: number;
    /** The row in the middle at the start (default `rest`) and the one to land on (default the last). */
    from?: number;
    to?: number;
    /** A near miss: stop one row short, strain at it, click over. `hold` is how long it strains (1100 ms). */
    tease?: boolean;
    hold?: number;
};
/**
 * A slot machine's reel: the app renders the strip as children and awaits `spin()`.
 *
 * @tagname ewo-slot-reel
 * @attr {'1' | '3'} rows - The window's height in rows; 3 shows the neighbours, faded (default 1).
 * @attr {number} rest - The row in the middle of the window at rest (default 0).
 * @attr {boolean} spinning - Set by the element while a spin runs.
 * @attr {boolean} landed - Set by the element for a moment after it lands.
 * @slot - The strip: one child per row.
 * @fires tick - A row passed the middle of the window: `detail.index`.
 * @fires land - The spin is over: `detail.index` is the row it landed on.
 * @cssprop --ewo-reel-row - A row's height (default 84px).
 * @cssprop --ewo-reel-fade - How far the edges fade while it spins (default 22%, 30% with three rows).
 * @cssprop --ewo-reel-sheen - The light that crosses the window as it lands.
 * @csspart window
 * @csspart track
 * @csspart sheen
 */
export declare class EwoSlotReel extends EwoElement {
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    private readonly track;
    private readonly sheen;
    private readonly strip;
    private running;
    private motion;
    private frame;
    private landedTimer;
    constructor();
    /** The row in the middle of the window at rest. */
    get rest(): number;
    set rest(value: number);
    /** Whether a spin is running. */
    get spinning(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    /** Spins from `from` to `to` (rows of the strip); resolves once it has landed. A second call while it runs gets the same promise. */
    spin(options?: SpinOptions): Promise<void>;
    private rows;
    private rowHeight;
    /** The track's offset that puts row `index` in the middle of the window. */
    private offset;
    private place;
    private run;
    private land;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-slot-reel': EwoSlotReel;
    }
}
