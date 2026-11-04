/** The values inlined into this page as `#ewo-config`, or `{}` without them. Read once. */
export declare function readConfig(doc?: Document): Readonly<Record<string, unknown>>;
/** One value Dashboard set for this page, if it has the shape the caller expects. */
export declare function configValue<T>(key: string, fits: (value: unknown) => value is T): T | undefined;
/**
 * The device's own choice when it made one, else Dashboard's value, else the fallback: a setting
 * like the language (`preferred(localStorage.getItem('ewo:lang'), 'lang', ['de', 'en'], browser)`).
 * Dashboard's `system` isn't one of the options, so it falls through to the fallback as it should.
 */
export declare function preferred<T extends string | number | boolean>(own: unknown, key: string, options: readonly T[], fallback: T): T;
