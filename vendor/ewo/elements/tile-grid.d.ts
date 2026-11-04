import { EwoElement } from './base';
import { type Tiles } from './tile-grid-math';
/**
 * Tiles on a grid of cells: drag one to move it (the tiles in its way make room), its edge to resize it.
 *
 * @tagname ewo-tile-grid
 * @attr {string} label - Names the grid.
 * @attr {number} columns - The grid's columns (default 12).
 * @attr {boolean} compact - Gaps close after every change: each tile rises as far as it can.
 * @attr {boolean} disabled - Only shown: no dragging, no keys, no spare row.
 * @slot - The tiles, one child each, with `data-key`, `data-rect` ("column row width height"), and optionally `data-min` ("width height") and `data-label` (its name, if its text isn't one).
 * @fires change - `detail: { layout, key, moved, how, action }` when a tile is dropped or stepped somewhere new: `layout` is every tile's new rect by key, `moved` the other tiles that made room, `how` 'free', 'swap' or 'push', `action` 'move' or 'resize'.
 * @fires tile-focus - `detail: { key }` when a tile gets the focus (a click or a tap selects it).
 * @csspart grid
 * @csspart cell - Each empty cell's outline.
 * @csspart tile - The element's box around each child.
 * @csspart ghost - Where a dragged tile will land.
 * @cssprop --ewo-tile-grid-row - A row's height (default 40px).
 * @cssprop --ewo-tile-grid-gap - The gap between cells (default 4px).
 * @cssprop --ewo-tile-grid-pad - A tile's padding (default 6px).
 * @cssprop --ewo-tile-grid-bg - A tile's background (default the raised background).
 */
export declare class EwoTileGrid extends EwoElement {
    #private;
    static styles: CSSStyleSheet[];
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string): void;
    get columns(): number;
    set columns(v: number);
    get compact(): boolean;
    set compact(v: boolean);
    get disabled(): boolean;
    set disabled(v: boolean);
    /** Every shown tile's rect by key, as the page set them. */
    get layout(): Tiles;
}
declare global {
    interface HTMLElementTagNameMap {
        'ewo-tile-grid': EwoTileGrid;
    }
}
