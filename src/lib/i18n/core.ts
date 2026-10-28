/**
 * Messages and formatting, without Svelte. Components use the reactive wrappers in
 * `index.svelte.ts`, which pass the current language in and make templates update when it changes.
 */

import { de } from './de.ts';
import { en, type MessageKey } from './en.ts';

export type Locale = 'en' | 'de';
export type { MessageKey };

const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = { en, de };

type Param = string | number;

export function translate(key: MessageKey, params: Record<string, Param> | undefined, locale: Locale): string {
  const template = DICTIONARIES[locale][key] ?? en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** The base of the keys that come in `.one` / `.other` pairs. */
export type PluralBase = { [K in MessageKey]: K extends `${infer Base}.other` ? Base : never }[MessageKey];

export function plural(base: PluralBase, count: number, params: Record<string, Param> | undefined, locale: Locale): string {
  const form = new Intl.PluralRules(locale).select(count) === 'one' ? 'one' : 'other';
  return translate(`${base}.${form}` as MessageKey, { count: count.toLocaleString(locale), ...params }, locale);
}
