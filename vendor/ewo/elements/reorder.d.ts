import { EwoElement } from './base';
import './button';
/**
 * A list you reorder by dragging a grip, with the keyboard, or with up and down buttons.
 *
 * @tagname ewo-reorder
 * @attr {string} label - Names the list.
 * @attr {boolean} arrows - Up and down buttons on every row (handy on a phone, where a list scrolls under the finger).
 * @attr {boolean} disabled - No grips or buttons: the order is only shown.
 * @slot - The rows, one child each, with `data-key` (and `data-label` for its name, if its text isn't one).
 * @fires change - `detail: { order, key, from, to }` when a row is dropped somewhere new; `order` is every `data-key` in the new order.
 * @csspart list
 * @csspart row - The element's row around each child.
 * @csspart grip
 * @cssprop --ewo-reorder-pad - A row's padding (default `6px 12px 6px 6px`).
 * @cssprop --ewo-reorder-bg - A row's background (default transparent).
 */
export declare class EwoReorder extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    get disabled(): boolean;
    set disabled(v: boolean);
    get arrows(): boolean;
    set arrows(v: boolean);
    /** Every row's key, in the order shown. */
    get order(): string[];
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-reorder': EwoReorder;
    }
}
