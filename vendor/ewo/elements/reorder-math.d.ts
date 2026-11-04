/** A row's place in the list when the drag began: its top edge and height, in px. */
export type Slot = {
    top: number;
    height: number;
};
/** The list with the item at `from` moved to `to`. */
export declare function moveItem<T>(list: readonly T[], from: number, to: number): T[];
/**
 * Where the dragged row lands after moving `offset` px: it passes a neighbour once its leading edge
 * (the bottom going down, the top going up) crosses that neighbour's middle, so half a row of travel
 * swaps two rows of the same height.
 */
export declare function dropIndex(slots: readonly Slot[], from: number, offset: number): number;
/** How far the dragged row may move: from the list's top edge to its bottom edge. */
export declare function dragRange(slots: readonly Slot[], from: number): [number, number];
/**
 * How far row `i` steps aside while the row at `from` hovers over `to`: by the dragged row's height
 * and the gap after it, toward the place it left.
 */
export declare function shiftOf(slots: readonly Slot[], from: number, to: number, i: number): number;
