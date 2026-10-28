import { agent as e } from "./emblem-agent.js";
import { doodle as t } from "./emblem-doodle.js";
import { heraldry as n, token as r } from "./emblem-heraldry.js";
import { tag as i } from "./emblem-tag.js";
//#region packages/elements/src/emblem-core.ts
var a = {
	heraldry: n,
	doodle: t,
	token: r,
	tag: i,
	agent: e
};
function o(e) {
	return a[e ?? ""] ?? n;
}
function s(e) {
	return o(e).parts.map((e) => e.options.length);
}
function c(e, t) {
	let n = s(e);
	return Array.isArray(t) && t.length === n.length && t.every((e, t) => Number.isInteger(e) && e >= 0 && e < n[t]);
}
function l(e, t = Math.random) {
	return s(e).map((e) => Math.floor(t() * e));
}
function u(e, t, n = Math.random) {
	return c(e, t) ? [...t] : l(e, n);
}
function d(e, t) {
	return o(e).fromSeed(t >>> 0);
}
function f(e) {
	if (!e) return null;
	let t = e.split(",").map((e) => Number(e.trim()));
	return t.every(Number.isInteger) ? t : null;
}
function p(e, t, n = {}) {
	let r = o(e);
	return r.svg(c(r.id, t) ? t : r.parts.map(() => 0), n);
}
function m(e, t) {
	return o(e).parts.map((e) => ({
		name: e.name[t],
		options: e.options.map((e) => e[t])
	}));
}
//#endregion
export { a as THEMES, u as cleanEmblem, d as emblemFromSeed, m as emblemNames, s as emblemRanges, p as emblemSvg, o as emblemTheme, c as isEmblem, f as parseEmblem, l as randomEmblem };
