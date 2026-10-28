import { EwoElement } from './base';
import './emblem';
/**
 * Choose an emblem: arrows per part around the big emblem, and a dice.
 *
 * @tagname ewo-emblem-maker
 * @attr {'heraldry' | 'doodle' | 'token' | 'tag' | 'agent'} theme - Which generator (default heraldry).
 * @attr {string} initial - Tag: the player's name, for the initial figure.
 * @attr {string} value - The numbers, comma-separated; the `value` property also takes an array. Random when missing.
 * @fires change - `detail: { value: number[] }` after a step or a roll.
 * @cssprop --ewo-emblem-maker-size - The big emblem's stage (default 200px).
 * @cssprop --ewo-emblem-maker-inset - The emblem's margin inside the stage (default 8%; Kritzle's 6%).
 * @csspart arrow - Each arrow button; the left ones are also `prev`, the right ones `next`.
 * @csspart prev - The left column's arrows.
 * @csspart next - The right column's arrows.
 * @csspart stage - The square the emblem sits on.
 * @csspart tag - The strip naming the new choice.
 * @csspart legend - The part names under the stage.
 * @csspart dice - The roll button.
 */
export declare class EwoEmblemMaker extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string): void;
    get theme(): string;
    set theme(v: string);
    get value(): number[];
    set value(v: number[] | string);
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-emblem-maker': EwoEmblemMaker;
    }
}
