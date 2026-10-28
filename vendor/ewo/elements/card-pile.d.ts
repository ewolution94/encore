/** A seat's place round the table from yours: 0 is you, then 1, 2 … in the order play goes. */
export declare const placeOf: (seat: number, home: number, n: number) => number;
/**
 * The direction a seat sits in: you at the bottom (90), the others spread from the left (180) over
 * the top (270) to the right (360). A watcher (home -1) sees the table from the first seat.
 */
export declare function seatAngle(seat: number, home: number, n: number): number;
/** A steady twist in degrees (-11 to 11) for a card from its key and seat, so every page agrees. */
export declare function cardTwist(key: string, seat?: number): number;
/** How wide a card on the pile is for a middle of w × h px (at most `cap`: 120 on a wide table, else 100). */
export declare const pileCardWidth: (w: number, h: number, cap?: number, ratio?: number) => number;
/**
 * Where a seat's card lies on the trick, from the middle's centre: a stack, each card nudged about a
 * third of a card towards the seat that played it, which keeps one of its corner indices in view
 * under the cards after it (left or up shows the top-left one, right or down the bottom-right one).
 */
export declare function trickSlot(angle: number, cardWidth: number, ratio?: number): {
    dx: number;
    dy: number;
};
/** Off the table towards a seat, for a middle of w × h px: where a taken trick sweeps to. */
export declare function sweepTo(angle: number, w: number, h: number): {
    dx: number;
    dy: number;
};
/**
 * A card on a discard pile (Mau-Mau's): stacked where it was dropped, a little off-centre and askew,
 * the same on every page. `index` counts from the bottom; only the last few need drawing.
 */
export declare function stackPlace(key: string, index: number, cardWidth: number): {
    dx: number;
    dy: number;
    r: number;
};
