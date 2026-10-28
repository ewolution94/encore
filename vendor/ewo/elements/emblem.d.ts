import { EwoElement } from './base';
/**
 * A player's emblem: Vollmond's shield, Kritzle's doodled face, or a coin, from a few numbers.
 *
 * @tagname ewo-emblem
 * @attr {'heraldry' | 'doodle' | 'token' | 'tag' | 'agent'} theme - Which generator draws it (default heraldry).
 * @attr {string} initial - Tag: the player's name; its first letter is figure 0.
 * @attr {string} value - The numbers, one per part, comma-separated ("3,7"). The `value` property also takes an array.
 * @attr {string} size - A number of pixels or any CSS length (default 48px).
 * @attr {'' | 'happy'} mood - Doodle: laughing eyes and mouth; agent: closed eyes and a smile.
 * @attr {boolean} crown - Doodle: the winner's crown.
 * @attr {boolean} boil - Doodle: redraws itself three ways in turn (still under reduced motion).
 * @attr {boolean} ring - Doodle, agent: an ink ring around the face.
 * @attr {boolean} dead - Heraldry and token: greyed and struck through.
 * @attr {string} label - Accessible name; without it the emblem is decoration.
 * @cssprop --ewo-emblem-1 - Heraldry's dark ink.
 * @cssprop --ewo-emblem-2 - Heraldry's bright ink.
 * @cssprop --ewo-emblem-3 - Heraldry's paper, and the charge.
 * @cssprop --ewo-emblem-ink - The shield's rim, the doodle's ring.
 * @cssprop --ewo-emblem-strike - The line through a dead emblem.
 * @cssprop --ewo-emblem-paper - What a doodle face sits on; the tag's hole.
 * @cssprop --ewo-emblem-tag-ink - The tag's outline (default a dark ink, on any page).
 * @cssprop --ewo-emblem-tag-0 - The tag's first colour (mint); -1 … -13 the others, in TAG_COLOURS' order.
 */
export declare class EwoEmblem extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    connectedCallback(): void;
    attributeChangedCallback(name: string, before: string | null, after: string | null): void;
    get value(): number[];
    set value(v: number[] | string);
    get theme(): string;
    set theme(v: string);
    get dead(): boolean;
    set dead(on: boolean);
    get boil(): boolean;
    set boil(on: boolean);
    get ring(): boolean;
    set ring(on: boolean);
    get crown(): boolean;
    set crown(on: boolean);
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-emblem': EwoEmblem;
    }
}
