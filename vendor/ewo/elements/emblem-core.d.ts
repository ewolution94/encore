export type Name = {
    de: string;
    en: string;
};
export type EmblemMood = '' | 'happy';
export interface EmblemPart {
    name: Name;
    options: Name[];
}
export interface DrawOptions {
    /** Doodle: which of the boil's redraws (0, 1, 2). */
    frame?: number;
    /** Doodle: a right guess laughs for a moment. */
    mood?: EmblemMood;
    /** Doodle: the winner's crown, drawn above the face. */
    crown?: boolean;
    /** Heraldry, token: greyed and struck through (out of the game). */
    dead?: boolean;
    /** Makes the clip path's id unique when several emblems share one document (not in a shadow root). */
    uid?: string;
    /** Tag: the player's name (or its first letter), drawn when figure 0 is chosen. */
    initial?: string;
}
export interface EmblemTheme {
    id: string;
    /** In the maker's order, top to bottom. */
    parts: EmblemPart[];
    /** The whole `<svg>` (viewBox 0 0 100 100), as markup. */
    svg(value: number[], options?: DrawOptions): string;
    /** Redraws that boil in turn (the doodle pen's wobble); one when absent. */
    frames?: number;
    /** The emblem a seed stands for, so one seed looks related in every theme (same charge, same colour slot). */
    fromSeed(seed: number): number[];
}
export declare const THEMES: Record<string, EmblemTheme>;
export type EmblemThemeId = 'heraldry' | 'doodle' | 'token' | 'tag' | 'agent';
export declare function emblemTheme(id: string | null | undefined): EmblemTheme;
/** How many choices each part has. */
export declare function emblemRanges(theme: string): number[];
export declare function isEmblem(theme: string, value: unknown): value is number[];
export declare function randomEmblem(theme: string, random?: () => number): number[];
/** What a player sent, if it's valid; otherwise a random emblem, so a bad value never blocks a join. */
export declare function cleanEmblem(theme: string, value: unknown, random?: () => number): number[];
/** The emblem a 32-bit seed stands for in this theme. */
export declare function emblemFromSeed(theme: string, seed: number): number[];
/** "3,7" ↔ [3, 7]: the attribute form. */
export declare function parseEmblem(text: string | null | undefined): number[] | null;
export declare function emblemSvg(theme: string, value: number[], options?: DrawOptions): string;
/** A part's or an option's name in the page's language. */
export declare function emblemNames(theme: string, lang: 'de' | 'en'): {
    name: string;
    options: string[];
}[];
