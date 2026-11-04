import { EwoElement } from './base';
/**
 * A pill button, a link that looks like one (`href`), or a round icon button (`icon`).
 *
 * @tagname ewo-button
 * @attr {'default' | 'primary' | 'quiet' | 'danger'} variant - `primary` is the one main action; `quiet` has no line until hovered.
 * @attr {'sm' | 'md' | 'lg'} size - 28, 34 or 44 px tall.
 * @attr {boolean} icon - Round, as wide as it is tall, for a single icon. Give it a `label`.
 * @attr {string} label - The accessible name, for an icon button (or to say more than the text).
 * @attr {boolean} stretch - Fill the container's width.
 * @attr {boolean} disabled
 * @attr {'button' | 'submit' | 'reset'} type - What it does in a form (default `button`).
 * @attr {string} href - Makes it a link.
 * @attr {string} target - The link's target; `_blank` adds rel="noopener".
 * @attr {string} download - Download the link instead of opening it.
 * @slot - The label (or the icon, with `icon`).
 * @slot start - An icon before the label.
 * @slot end - An icon after the label (an arrow, a count).
 * @csspart control - The inner <button> or <a>.
 */
export declare class EwoButton extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static formAssociated: boolean;
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(): void;
    get variant(): string;
    set variant(v: string);
    get disabled(): boolean;
    set disabled(v: boolean);
    get icon(): boolean;
    set icon(v: boolean);
    get stretch(): boolean;
    set stretch(v: boolean);
    get type(): 'button' | 'submit' | 'reset';
    set type(v: 'button' | 'submit' | 'reset');
    get href(): string;
    set href(v: string);
    get label(): string;
    set label(v: string);
    get form(): HTMLFormElement | null;
    formDisabledCallback(disabled: boolean): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-button': EwoButton;
    }
}
