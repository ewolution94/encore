export type Rect = [column: number, row: number, width: number, height: number];
export type Tiles = Record<string, Rect>;
export type GridOptions = {
    columns: number;
    /** Close the gaps after every change: each tile rises as far as the tiles above it let it. */
    compact?: boolean;
};
/**
 * The tiles after a change. `how`: `free` when nothing was in the way, `swap` when the tiles in the
 * way took the place the tile left, `push` when they moved down below it. `moved`: the other tiles
 * whose rect changed.
 */
export type Arranged = {
    tiles: Tiles;
    how: 'free' | 'swap' | 'push';
    moved: string[];
};
/** The most rows a grid grows to, so a push can't run away. */
export declare const MAX_ROWS = 200;
export declare const overlaps: (a: Rect, b: Rect) => boolean;
/** Inside the grid's columns and rows. */
export declare const fits: (r: Rect, columns: number) => boolean;
/** The rows the tiles take up: the lowest tile's bottom row. */
export declare const rowsOf: (tiles: Tiles) => number;
/** The tiles other than `key` that `r` would cover. */
export declare function inTheWay(tiles: Tiles, key: string, r: Rect): string[];
/**
 * Every tile risen as far as it goes, top row first (gravity, as a dashboard closes up). On a tie
 * `first` goes first, so a dropped tile keeps the spot it was dropped on.
 */
export declare function compact(tiles: Tiles, first?: string): Tiles;
/**
 * `key` put at `to`, the tiles in its way making room. A move (not a resize) first tries to trade
 * places: the tiles in the way move by the same step the other way, into the place it left (two
 * tiles the same size swap; two small ones take a big one's place side by side), or, with one tile
 * half covered, the two swap corners. Where neither fits, the tiles in the way move down below it,
 * and the tiles below them move down too. `to` must fit the grid.
 */
export declare function arrange(tiles: Tiles, key: string, to: Rect, options: GridOptions): Arranged;
/** `key` at a new size from the same corner, clamped to `min` and the grid; the tiles in its way move down. */
export declare function resize(tiles: Tiles, key: string, width: number, height: number, min: [number, number], options: GridOptions): Arranged;
/**
 * One step with the keyboard (dx, dy of -1, 0 or 1). Into a free cell it simply moves; into a tile
 * it trades places with that tile when the two can, else the tiles in the way move down. Returns
 * null at the grid's edge, or when the step changes nothing (a compact grid where the tile can't
 * rise).
 */
export declare function step(tiles: Tiles, key: string, dx: number, dy: number, options: GridOptions): Arranged | null;
/**
 * Every gap closed, the ones beside tiles too: the tiles in reading order, each put in the first
 * spot it fits, reading row by row. A tile can move up past a gap into a row above, so it's a tidy-up
 * the user asks for, not what a drag does.
 */
export declare function pack(tiles: Tiles, columns: number): Tiles;
/** Whether `pack` would change anything. */
export declare const hasGaps: (tiles: Tiles, columns: number) => boolean;
/** The first free spot for a tile of this size, reading row by row; below everything when the grid is full. */
export declare function firstFree(tiles: Tiles, width: number, height: number, columns: number): Rect;
/** The grid's pitch in px: one column plus its gap, one row plus its gap. */
export type Pitch = {
    x: number;
    y: number;
};
/** A dragged tile's new top-left corner, `dx`, `dy` px from where it began, snapped to the nearest cell. */
export declare function snapMove(from: Rect, dx: number, dy: number, pitch: Pitch, columns: number): [column: number, row: number];
/** A tile's new size while its edge is dragged `dx`, `dy` px, to the nearest cell. */
export declare function snapSize(from: Rect, dx: number, dy: number, pitch: Pitch): [width: number, height: number];
