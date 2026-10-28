import { EwoElement } from './base';
export type ConnectionState = 'connecting' | 'reconnecting' | 'online';
/**
 * The connection, in a word, when it's worth one.
 *
 * @tagname ewo-connection
 * @attr {'connecting' | 'reconnecting' | 'online'} state - What the connection is doing (default online).
 * @attr {string} connecting-label - Overrides "Connecting …".
 * @attr {string} reconnecting-label - Overrides "Reconnecting …".
 * @attr {string} back-label - Overrides "Connected again".
 * @slot mark - A game's working mark (three dots by default).
 * @cssprop --ewo-connection-top - Where the pill sits (default: 12 px below the safe area).
 * @cssprop --ewo-connection-bg - The pill's background (default --ewo-fg).
 * @cssprop --ewo-connection-fg - Its text (default --ewo-bg).
 * @cssprop --ewo-connection-font - Its font family.
 * @csspart pill
 */
export declare class EwoConnection extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    constructor();
    get state(): ConnectionState;
    set state(value: ConnectionState);
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-connection': EwoConnection;
    }
}
