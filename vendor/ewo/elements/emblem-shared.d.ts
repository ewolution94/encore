/** The emblem the player chose in this theme, in any game. */
export declare function sharedEmblem(theme: string): number[] | null;
/** Your emblem in a charge theme you have none in yet, from the newest of the other two: the same charge, division and colour slot where they have them. */
export declare function relatedEmblem(theme: string, random?: () => number): number[] | null;
/** Between the charge themes: token [colour, division, charge], heraldry [field, charge], tag [colour, pattern, figure]. */
export declare function translate(from: string, value: number[], to: string, random?: () => number): number[];
/** Keeps the player's choice for every game. Call it when they pick one, not when a game only loads one. */
export declare function shareEmblem(theme: string, value: number[]): void;
/**
 * The emblem a game shows: the one shared in this theme; else the game's own (`own`, kept as it is);
 * else one related to your newest in a charge theme; else a fresh random one, shared, so a new player
 * looks the same in the next game too. The game keeps what this returns in its own storage.
 */
export declare function playerEmblem(theme: string, own: unknown, random?: () => number): number[];
/** The name the player last joined with, in any game ('' when none). */
export declare function sharedName(): string;
export declare function shareName(name: string): void;
