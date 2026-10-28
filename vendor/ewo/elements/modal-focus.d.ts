export declare function trackInput(): void;
/** Whether the last input was a key. */
export declare const lastInputWasKey: () => boolean;
/** The focused element, through open shadow roots; null for the page itself. */
export declare function deepActive(): HTMLElement | null;
/** What focus returns to when the modal closes: the focused element, or the control just tapped (unfocused in Safari). */
export declare function openerNow(): HTMLElement | null;
/** Blur whatever has focus in the modal (its dialog, a slotted control, or one in its shadow root). */
export declare function letGo(host: HTMLElement, root: ShadowRoot, dialog: HTMLElement): void;
/**
 * Focus ends on the opener, never on the page (VoiceOver and Switch Control rely on it): the
 * dialog's own return happens only when focus was inside it, and Safari's opener was never focused.
 */
export declare function returnFocus(opener: HTMLElement | null, dialog: HTMLElement, quiet: boolean): void;
