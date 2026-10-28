import { emblemFromSeed as e, emblemRanges as t, isEmblem as n, randomEmblem as r } from "./emblem-core.js";
//#region packages/elements/src/emblem-shared.ts
var i = "ewo-me", a = "ewolution.cloud", o = 3456e4, s = 40, c = [
	"token",
	"heraldry",
	"tag",
	"doodle",
	"agent"
], l = [
	"token",
	"heraldry",
	"tag"
], u = 7, d = !1;
function f() {
	if (typeof document > "u") return new URLSearchParams();
	try {
		let e = document.cookie.split("; ").find((e) => e.startsWith("ewo-me=")), t = new URLSearchParams(e?.slice(7) ?? "");
		return e && !d && p(t), t;
	} catch {
		return new URLSearchParams();
	}
}
function p(e) {
	if (typeof document > "u") return;
	d = !0;
	let t = typeof location > "u" ? "" : location.hostname, n = t === a || t.endsWith("." + a), r = typeof location < "u" && location.protocol === "https:";
	try {
		document.cookie = `${i}=${e.toString()}; Path=/; Max-Age=${o}; SameSite=Lax` + (n ? `; Domain=${a}` : "") + (r ? "; Secure" : "");
	} catch {}
}
function m(e, t) {
	let r = e.get(t);
	if (!r) return null;
	let i = r.split(".").map(Number);
	return n(t, i) ? i : null;
}
function h(e) {
	return m(f(), e);
}
function g(e, t = Math.random) {
	if (!l.includes(e)) return null;
	let n = f(), r = [n.get("last"), ...l].find((t) => !!t && t !== e && l.includes(t) && m(n, t) !== null);
	return r ? _(r, m(n, r), e, t) : null;
}
function _(n, r, i, a = Math.random) {
	let o = n === "token" ? {
		colour: r[0],
		division: r[1],
		charge: r[2]
	} : n === "heraldry" ? {
		division: r[0],
		charge: r[1]
	} : {
		colour: r[0],
		charge: r[2] >= u ? r[2] - u : void 0
	}, s = e(i, Math.floor(a() * 2 ** 32)), c = i === "token" ? [
		o.colour ?? s[0],
		o.division ?? s[1],
		o.charge ?? s[2]
	] : i === "heraldry" ? [o.division ?? s[0], o.charge ?? s[1]] : [
		o.colour ?? s[0],
		s[1],
		o.charge === void 0 ? s[2] : o.charge + u
	], l = t(i);
	return c.map((e, t) => Number.isInteger(e) && e >= 0 && e < l[t] ? e : s[t]);
}
function v(e, t) {
	if (!c.includes(e) || !n(e, t)) return;
	let r = f();
	r.set(e, t.join(".")), l.includes(e) && r.set("last", e), p(r);
}
function y(e, t, i = Math.random) {
	let a = h(e);
	if (a) return a;
	if (n(e, t)) return [...t];
	let o = g(e, i);
	if (o) return o;
	let s = r(e, i);
	return v(e, s), s;
}
function b() {
	return (f().get("name") ?? "").trim().slice(0, s);
}
function x(e) {
	let t = f(), n = e.trim().slice(0, s);
	n ? t.set("name", n) : t.delete("name"), p(t);
}
//#endregion
export { y as playerEmblem, g as relatedEmblem, v as shareEmblem, x as shareName, h as sharedEmblem, b as sharedName, _ as translate };
