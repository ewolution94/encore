//#region packages/elements/src/reel-strip.ts
function e(e, t = -1, n = Math.random) {
	if (e <= 0) return -1;
	if (e === 1) return 0;
	let r = t >= 0 && t < e, i = Math.floor(n() * (r ? e - 1 : e));
	return r && i >= t ? i + 1 : i;
}
function t(t, n, r, i = -1, a = Math.random) {
	if (t <= 1) return [n];
	let o = i >= 0 && i < t ? [i] : [];
	for (; o.length < r - 1;) o.push(e(t, o.at(-1) ?? -1, a));
	return o.at(-1) === n && o.push((n + 1) % t), o.push(n), o;
}
var n = {
	pull: 140,
	creep: 460,
	hold: 1100,
	duration: 2100
}, r = (e) => Math.max(0, Math.min(1, e));
function i({ from: e, to: t, duration: i = n.duration, tease: a = !1, hold: o = n.hold }) {
	let s = Math.max(n.pull + 200, i), c = a && t - e >= 2, l = c ? t - 1 : t, u = s + (c ? o + n.creep : 0);
	return {
		total: u,
		at: (i) => {
			if (i <= 0) return e;
			if (i >= u) return t;
			if (i < n.pull) return e - .2 * Math.sin(Math.PI * i / n.pull);
			if (i < s) {
				let t = (i - n.pull) / (s - n.pull);
				return e + (l - e) * (1 - (1 - t) ** 3) + .3 * Math.sin(Math.PI * r((t - .84) / .16));
			}
			let a = i - s;
			if (a < o) return l + .14 * Math.abs(Math.sin(a / o * Math.PI * 2.5));
			let c = (a - o) / n.creep;
			return l + 1 + 2.7 * (c - 1) ** 3 + 1.7 * (c - 1) ** 2;
		},
		teasing: c
	};
}
//#endregion
export { n as REEL, i as reelMotion, e as reelPick, t as reelStrip };
