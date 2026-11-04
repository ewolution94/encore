import { EwoElement } from './base';
/**
 * A plain <table>, in Folio's hairline style, that scrolls sideways when it's too wide.
 *
 * @tagname ewo-table
 * @attr {string} label - Names the scroll region. The table itself is named by its <caption> or aria-label.
 * @attr {'normal' | 'compact'} density
 * @attr {boolean} nowrap - Keeps every cell on one line; the table scrolls instead.
 * @attr {boolean} sticky - The first column stays put while the rest scrolls; it's painted in `--ewo-table-bg` (the raised surface).
 * @attr {boolean} hover - Rows light up under the mouse.
 * @slot - One <table>.
 * @csspart scroll - The sideways-scrolling box.
 */
export declare class EwoTable extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-table': EwoTable;
    }
}
