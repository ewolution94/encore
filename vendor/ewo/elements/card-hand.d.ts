import { type Fan } from './card-fan';
export interface Dragged {
    key: string;
    /** Top left in the hand's px, and the turn the flick's speed gives it. */
    x: number;
    y: number;
    r: number;
}
export interface HandGestureOptions {
    /** The current layout (read on every event). */
    fan(): Fan;
    /** The card standing raised, if any. */
    lifted(): string | null;
    /** Raise a card (or none). */
    lift(key: string | null): void;
    /** False while the hand mustn't be touched (a card in the air, an empty hand). */
    enabled?(): boolean;
    /** 'select': a tap toggles a card (`toggle`), nothing is dragged or played. Default 'play'. */
    mode?(): 'play' | 'select';
    /** Whether it's your move at all. */
    canPlay(): boolean;
    /** Whether this card may be played now. */
    playable(key: string): boolean;
    /** Dragged out, flicked, or tapped a second time. */
    play(key: string): void;
    /** A card that may not be played was tried. */
    refuse?(key: string): void;
    /** Select mode: a tap. */
    toggle?(key: string): void;
    /** Held still. */
    inspect?(key: string): void;
    /** The card under the finger while it's dragged, then null. */
    drag?(at: Dragged | null): void;
    /** Cards that stand raised in select mode, for hit-testing. */
    raised?(): ReadonlySet<string>;
    /** How long a still finger waits before `inspect` (480 ms). */
    holdMs?: number;
}
export declare function handGestures(box: HTMLElement, o: HandGestureOptions): {
    destroy(): void;
};
