import { EwoElement } from './base';
/**
 * A labelled text field, single line or `multiline`.
 *
 * @tagname ewo-field
 * @attr {string} label - Names the field. Always give one; `nolabel` hides it from sight only.
 * @attr {boolean} nolabel - The label is read out but not shown (a card header already names the field).
 * @attr {string} value - The text.
 * @attr {string} placeholder
 * @attr {string} hint - A quieter line under the field.
 * @attr {string} error - Shown under the field in red, and marks it invalid.
 * @attr {'text' | 'search' | 'url' | 'email' | 'number' | 'tel'} type - For a single line (default `text`).
 * @attr {boolean} multiline - A <textarea>.
 * @attr {number} rows - The textarea's height in lines.
 * @attr {boolean} autogrow - The textarea grows with its text instead of scrolling.
 * @attr {number} maxlength
 * @attr {boolean} counter - Shows "used / maxlength" beside the label.
 * @attr {'sm' | 'md'} size - 32 or 38 px tall.
 * @attr {string} name - Form field name.
 * @attr {boolean} required
 * @attr {boolean} disabled
 * @attr {boolean} readonly
 * @attr {string} autocomplete
 * @attr {string} inputmode
 * @slot start - An icon inside the field, before the text.
 * @slot end - Something inside the field after the text (a unit, a small button).
 * @fires input - `detail: { value }` on every keystroke.
 * @fires change - `detail: { value }` on Enter or when the field is left with a new value.
 * @csspart label
 * @csspart box - The field's outline.
 * @csspart control - The inner <input> or <textarea>.
 * @csspart hint
 * @csspart error
 */
export declare class EwoField extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static formAssociated: boolean;
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string): void;
    get value(): string;
    set value(v: string);
    get disabled(): boolean;
    set disabled(v: boolean);
    get required(): boolean;
    set required(v: boolean);
    get readonly(): boolean;
    set readonly(v: boolean);
    get multiline(): boolean;
    set multiline(v: boolean);
    get counter(): boolean;
    set counter(v: boolean);
    get nolabel(): boolean;
    set nolabel(v: boolean);
    get error(): string;
    set error(v: string);
    get form(): HTMLFormElement | null;
    get validity(): ValidityState;
    checkValidity(): boolean;
    reportValidity(): boolean;
    /** Selects the whole text. */
    select(): void;
    formResetCallback(): void;
    formDisabledCallback(disabled: boolean): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-field': EwoField;
    }
}
