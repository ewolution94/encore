import { EwoElement } from './base';
/**
 * The settings button: the sliders icon, the same in every app.
 *
 * @tagname ewo-settings-button
 * @attr {string} label - Accessible name and tooltip; by default "Settings" / "Einstellungen" after <html lang>.
 * @attr {boolean} show-label - Also show the label beside the icon above 640px (Fermata's variant).
 * @csspart button - The button, for an app's header proportions.
 * @csspart label - The text beside the icon (with `show-label`).
 */
export declare class EwoSettingsButton extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    /** Focuses the inner button (after the sheet closes, focus returns here). */
    focus(options?: FocusOptions): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-settings-button': EwoSettingsButton;
    }
}
