export type Json = null | boolean | number | string | Json[] | {
    [key: string]: Json;
};
/** A label: English, with German optional. */
export type Text = string | {
    en: string;
    de?: string;
};
/** One of a set of ids (a game, a row, a tile), with what the form shows for it. */
export interface Item {
    id: string;
    label?: Text;
    hint?: Text;
}
interface Base {
    label?: Text;
    help?: Text;
    /** The heading the setting is listed under on the app's page. */
    group?: Text;
}
export interface BoolSpec extends Base {
    type: 'bool';
    default: boolean;
}
export interface EnumSpec extends Base {
    type: 'enum';
    options: (string | number)[];
    /** Labels per option, keyed by the option as a string. */
    labels?: Record<string, Text>;
    default: string | number;
}
export interface NumberSpec extends Base {
    type: 'int' | 'number';
    min?: number;
    max?: number;
    step?: number;
    unit?: Text;
    default: number;
}
export interface TextSpec extends Base {
    type: 'text';
    maxLength?: number;
    multiline?: boolean;
    default: string;
}
/** An ordered list of a known set of ids. */
export interface OrderSpec extends Base {
    type: 'order';
    ids: Item[];
    default?: string[];
}
/** Exactly `n` of a known set of ids, in order. `from` names order settings whose rows it picks from. */
export interface PickSpec extends Base {
    type: 'pick';
    ids: Item[];
    n: number;
    from?: string[];
    default: string[];
}
/** An ordered list of records, one per known id, each with a few small fields (a game: on or off). */
export interface ItemsSpec extends Base {
    type: 'items';
    ids: Item[];
    fields: Record<string, BoolSpec | EnumSpec | NumberSpec>;
    default?: ItemsValue;
}
/** Tiles on grids of cells at several widths, plus an order and heights for one column (Atrium's wall). */
export interface LayoutSpec extends Base {
    type: 'layout';
    grids: Record<string, {
        columns: number;
        label?: Text;
    }>;
    groups: Item[];
    tiles: (Item & {
        group: string;
        min?: [number, number];
    })[];
    /** The heights a tile may have in one column, in px; `base` is the one it has unless set. */
    heights?: number[];
    base?: number;
    default: LayoutValue;
}
/** A family setting (language, theme, sounds, motion) the app takes: with its own default, or fixed to one value. */
export interface FamilyRef extends Base {
    family: true;
    default?: Json;
    fixed?: Json;
}
export type ValueSpec = BoolSpec | EnumSpec | NumberSpec | TextSpec | OrderSpec | PickSpec | ItemsSpec | LayoutSpec;
export type SettingSpec = ValueSpec | FamilyRef;
export type ItemsValue = ({
    id: string;
} & Record<string, Json>)[];
export type Rect = [column: number, row: number, width: number, height: number];
/**
 * Per grid (`wide`, `mid`): `columns`, then per group each placed tile's cells; tiles without a
 * place flow in after them. `narrow` is the one column: `base` height, `heights` per tile, `order` per group.
 */
export type LayoutValue = {
    [key: string]: Json;
};
export interface Manifest {
    app: string;
    version: number;
    settings: Record<string, SettingSpec>;
}
/** What Dashboard holds and hands an app: the family's values and the app's own. */
export interface Values {
    family?: Record<string, Json>;
    app?: Record<string, Json>;
}
/**
 * Where a value a new visitor gets comes from: set in Dashboard for this app (`app`), the app's own
 * default for a family setting (`own`), set in Dashboard for every app (`family`), the built-in
 * default (`built-in`), or the only one the app has (`fixed`).
 */
export type Source = 'app' | 'own' | 'family' | 'built-in' | 'fixed';
/** The settings every app can take from the family, with the family's built-in defaults. */
export declare const FAMILY: Record<'lang' | 'theme' | 'sounds' | 'motion', ValueSpec>;
export declare const isFamilyRef: (spec: SettingSpec) => spec is FamilyRef;
/** The spec a value of `key` is checked against: a family setting's own, or the app's. */
export declare function specOf(key: string, spec: SettingSpec): ValueSpec | undefined;
/** A label in `lang`, falling back to English, then to `fallback`. */
export declare function text(value: Text | undefined, lang: string, fallback?: string): string;
/**
 * A value checked against its spec: the cleaned value, or undefined when it doesn't fit. Lists are
 * forgiving the way an app needs them to be: an id the spec doesn't know is dropped, and one the
 * value doesn't name keeps its built-in place at the end (a new game shows up, on). A layout is all
 * or nothing: a tile off the grid, below its smallest size or on another one makes it undefined.
 */
export declare function check(spec: ValueSpec, value: unknown): Json | undefined;
/** The height a tile has in one column unless it's set. */
export declare function layoutBase(spec: LayoutSpec): number;
/** The default a setting has before anything is set: its own, else (for a family setting) the family's. */
export declare function builtIn(key: string, spec: SettingSpec): Json | undefined;
/**
 * Every setting's effective value and where it comes from. A visitor's own choice on their device
 * comes before all of these (config-client.ts). For a family setting: fixed, else set for the app,
 * else the app's own default (the six German games stay German whatever the family says), else set
 * for the family, else the family's built-in. For the app's own: set for the app, else built-in.
 */
export declare function resolve(manifest: Manifest, values: Values): {
    values: Record<string, Json>;
    sources: Record<string, Source>;
};
/**
 * A manifest checked before it's used: the settings that are fine, and what's wrong with the rest.
 * `ok` is false only when nothing usable is left (no app slug, no version, no settings object).
 */
export declare function checkManifest(raw: unknown): {
    ok: boolean;
    manifest: Manifest;
    problems: string[];
};
export {};
