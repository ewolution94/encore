//#region packages/elements/src/reel-strip.ts
function e() {
	return globalThis.crypto.getRandomValues(/* @__PURE__ */ new Uint32Array(1))[0];
}
function t(t, n = e) {
	if (!Number.isInteger(t) || t < 1 || t > 4294967296) throw RangeError("fairInt needs an integer 1 ≤ n ≤ 2^32");
	let r = Math.floor(4294967296 / t) * t, i = n() >>> 0;
	for (; i >= r;) i = n() >>> 0;
	return i % t;
}
function n(e, n = -1, r) {
	if (e <= 0) return -1;
	if (e === 1) return 0;
	let i = n >= 0 && n < e, a = i ? e - 1 : e, o = r ? Math.floor(r() * a) : t(a);
	return i && o >= n ? o + 1 : o;
}
function r(e, t, r, i = -1, a = Math.random) {
	if (e <= 1) return [t];
	let o = i >= 0 && i < e ? [i] : [];
	for (; o.length < r - 1;) o.push(n(e, o.at(-1) ?? -1, a));
	return o.at(-1) === t && o.push((t + 1) % e), o.push(t), o;
}
var i = {
	pull: 140,
	creep: 460,
	hold: 1100,
	duration: 2100
}, a = (e) => Math.max(0, Math.min(1, e));
function o({ from: e, to: t, duration: n = i.duration, tease: r = !1, hold: o = i.hold }) {
	let s = Math.max(i.pull + 200, n), c = r && t - e >= 2, l = c ? t - 1 : t, u = s + (c ? o + i.creep : 0);
	return {
		total: u,
		at: (n) => {
			if (n <= 0) return e;
			if (n >= u) return t;
			if (n < i.pull) return e - .2 * Math.sin(Math.PI * n / i.pull);
			if (n < s) {
				let t = (n - i.pull) / (s - i.pull);
				return e + (l - e) * (1 - (1 - t) ** 3) + .3 * Math.sin(Math.PI * a((t - .84) / .16));
			}
			let r = n - s;
			if (r < o) return l + .14 * Math.abs(Math.sin(r / o * Math.PI * 2.5));
			let c = (r - o) / i.creep;
			return l + 1 + 2.7 * (c - 1) ** 3 + 1.7 * (c - 1) ** 2;
		},
		teasing: c
	};
}
//#endregion
export { i as REEL, e as cryptoWord, t as fairInt, o as reelMotion, n as reelPick, r as reelStrip };
