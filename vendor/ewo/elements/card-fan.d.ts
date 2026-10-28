export interface FanOptions {
    /** The hand's width in px. */
    width: number;
    /** How many cards to size for (default: the keys; Stichle counts a card still in the air). */
    count?: number;
    /** The largest a card may be with up to 3, up to 6, and more cards ([104, 92, 84]). */
    sizes?: readonly [number, number, number];
    /** The smallest a card gets (62). */
    min?: number;
    /** A card's height over its width (1.4). */
    ratio?: number;
    /** The most of a card's width that shows between neighbours (0.62). */
    overlap?: number;
    /** Below this step (px between neighbours) the hand goes to two rows (24). */
    twoRowsBelow?: number;
    /** How far a lifted card rises (24). */
    lift?: number;
    /** How far the fan's ends dip (8) and turn, in degrees (7). */
    dip?: number;
    turn?: number;
    /** Room below the cards (8) and above them (22), inside `height`. */
    bottom?: number;
    top?: number;
}
export interface FanPlace {
    /** Top left, in the hand's own px. */
    x: number;
    y: number;
    /** Turn, in degrees. */
    r: number;
    /** Stacking: later cards and the front row on top. */
    z: number;
    /** 0 for the front row, 1 for the row behind. */
    row: number;
}
export interface Fan {
    /** Card width and height. */
    cw: number;
    ch: number;
    rows: 1 | 2;
    /** The height the hand needs. */
    height: number;
    lift: number;
    places: Map<string, FanPlace>;
}
export declare function fanLayout(keys: readonly string[], options: FanOptions): Fan;
/** A card's CSS transform in the fan: lifted cards rise and grow a little. */
export declare function fanTransform(fan: Fan, key: string, state?: {
    lifted?: boolean;
}): string;
/**
 * The card under a point in the hand's own px: the topmost one whose box holds it, else the nearest
 * along the row the finger is level with (so a thumb running below or beside the fan still picks).
 * `lifted` names the cards that stand raised.
 */
export declare function cardAt(fan: Fan, x: number, y: number, lifted?: ReadonlySet<string> | string | null): string | null;
/**
 * Where a card flies to, as a transform in the hand's px: from the fan to a point on the page (`to`,
 * the centre of where it lands, in client px, with its turn and width there).
 */
export declare function flightTransform(fan: Fan, hand: DOMRect, to: {
    x: number;
    y: number;
    rot: number;
    width: number;
}): string;
