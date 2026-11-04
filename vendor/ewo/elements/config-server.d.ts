import { type Json, type Manifest, type Source } from './config-core';
export interface ConfigOptions {
    manifest: Manifest;
    /** Dashboard's internal origin, e.g. http://dashboard:8081. Empty: built-in values only. */
    url?: string;
    /** Where the last good answer is kept across restarts (an app with a /data volume). */
    dataFile?: string;
    every?: number;
    timeout?: number;
    log?: (line: string) => void;
}
export interface Config {
    start(): Promise<void>;
    stop(): void;
    /** The values a new visitor gets, and where each comes from. */
    get(): {
        values: Record<string, Json>;
        sources: Record<string, Source>;
    };
    /** `starting`, `ok`, `down`, or `off` without a URL. */
    state(): 'starting' | 'ok' | 'down' | 'off';
    /** Changes whenever the values do: a key for caching the page. */
    etag(): string;
    /** The page with the values as `<script type="application/json" id="ewo-config">`, first in <head>. */
    inject(html: string): string;
}
export declare function createConfig({ manifest, url, dataFile, every, timeout, log }: ConfigOptions): Config;
