import { EwoElement } from './base';
import './segmented';
export type LanguageChoice = 'system' | 'de' | 'en';
export type ThemeChoice = 'system' | 'light' | 'dark';
/**
 * Language and Theme, the first rows of every app's settings.
 *
 * @tagname ewo-settings-basics
 * @attr {'system' | 'de' | 'en'} language - The stored language choice.
 * @attr {'system' | 'light' | 'dark'} theme - The stored theme choice.
 * @attr {string} language-label - Overrides "Language" / "Sprache" (the words follow <html lang>).
 * @attr {string} theme-label - Overrides "Theme" / "Design".
 * @attr {string} system-label - Overrides "System" (both rows).
 * @attr {string} light-label - Overrides "Light" / "Hell".
 * @attr {string} dark-label - Overrides "Dark" / "Dunkel".
 * @fires language-change - `detail: { value }` after a pick; store it, apply it through themeShift.
 * @fires theme-change - `detail: { value }` after a pick; store it, apply it through themeShift.
 */
export declare class EwoSettingsBasics extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    constructor();
    get language(): LanguageChoice;
    set language(value: LanguageChoice);
    get theme(): ThemeChoice;
    set theme(value: ThemeChoice);
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-settings-basics': EwoSettingsBasics;
    }
}
