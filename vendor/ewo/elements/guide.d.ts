import { EwoElement } from './base';
/**
 * A how-to in full-screen pages: swipe, the dots, Back and Next; Done on the last.
 *
 * @tagname ewo-guide
 * @attr {boolean} open
 * @attr {string} label - Accessible name of the guide.
 * @attr {string} next-label - Instead of "Next".
 * @attr {string} back-label - Instead of "Back".
 * @attr {string} done-label - The last page's button, instead of "Done".
 * @attr {string} skip-label - Instead of "Skip".
 * @slot - The pages: one child each (an aria-label or its first heading names it).
 * @fires cancel - Cancelable: Escape, Skip or the backdrop asked to close.
 * @fires done - The last page's button was pressed.
 * @fires page - The page shown changed; `detail.index`.
 * @fires close - After it has closed.
 * @csspart dialog
 * @csspart track
 * @csspart footer
 * @csspart skip
 * @csspart back
 * @csspart next
 * @csspart dots
 * @cssprop --ewo-guide-bg
 * @cssprop --ewo-guide-fg
 * @cssprop --ewo-guide-fg-2
 * @cssprop --ewo-guide-accent
 * @cssprop --ewo-guide-accent-ink
 * @cssprop --ewo-guide-dot
 * @cssprop --ewo-guide-dot-on
 */
export declare class EwoGuide extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string): void;
    get open(): boolean;
    set open(v: boolean);
    /** The page shown, from 0. */
    get page(): number;
    show(): void;
    close(): void;
    /** Turns to a page (clamped); at once, with a fade, under reduced motion. */
    goTo(index: number): void;
}
/** True on a device's first visit (and remembers it); false after, or when storage is unavailable. */
export declare function firstVisit(key: string): boolean;
declare global {
    interface HTMLElementTagNameMap {
        'ewo-guide': EwoGuide;
    }
}
