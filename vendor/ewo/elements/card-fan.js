//#region packages/elements/src/card-fan.ts
function e(e, t) {
	let n = Math.max(0, t.width), r = t.count ?? e.length, [i, a, o] = t.sizes ?? [
		104,
		92,
		84
	], s = t.min ?? 62, c = t.ratio ?? 1.4, l = t.overlap ?? .62, u = t.lift ?? 24, d = t.dip ?? 8, f = t.turn ?? 7, p = t.bottom ?? 8, m = t.top ?? 22, h = Math.round(Math.max(s, Math.min(r <= 3 ? i : r <= 6 ? a : o, n / (r * l + .6)))), g = Math.round(h * c), _ = e.length, v = _ > 1 && (n - 8 - h) / (_ - 1) < (t.twoRowsBelow ?? 24) ? 2 : 1, y = Math.round(g * .45), b = (v === 2 ? g + y : g) + p + m, x = /* @__PURE__ */ new Map(), S = v === 2 ? Math.ceil(_ / 2) : _, C = v === 2 ? [e.slice(0, S), e.slice(S)] : [e.slice()];
	return C.forEach((e, t) => {
		let r = e.length, i = r > 1 ? Math.min(h * l, (n - 8 - h) / (r - 1)) : 0, a = (n - (h + i * (r - 1))) / 2, o = t === C.length - 1, s = b - g - p - (o ? 0 : y);
		e.forEach((e, t) => {
			let n = r > 1 ? (t - (r - 1) / 2) / ((r - 1) / 2) : 0;
			x.set(e, {
				x: a + t * i,
				y: s + n * n * d,
				r: n * f,
				z: (o ? 100 : 0) + t + 1,
				row: +!o
			});
		});
	}), {
		cw: h,
		ch: g,
		rows: v,
		height: b,
		lift: u,
		places: x
	};
}
function t(e, t, n = {}) {
	let r = e.places.get(t);
	if (!r) return "";
	let i = n.lifted ? e.lift : 0;
	return `translate(${r.x.toFixed(1)}px, ${(r.y - i).toFixed(1)}px) rotate(${r.r.toFixed(2)}deg) scale(${n.lifted ? 1.05 : 1})`;
}
function n(e, t, n, r = null) {
	let i = (e) => r === null ? !1 : typeof r == "string" ? r === e : r.has(e), a = null, o = -1;
	for (let [r, s] of e.places) {
		let c = s.y - (i(r) ? e.lift : 0);
		t >= s.x && t <= s.x + e.cw && n >= c - 6 && n <= s.y + e.ch && s.z > o && (a = r, o = s.z);
	}
	if (a) return a;
	let s = null, c = Infinity;
	for (let [r, i] of e.places) {
		let a = Math.abs(t - (i.x + e.cw / 2)) + Math.abs(n - (i.y + e.ch / 2)) * .3;
		a < c && (c = a, s = r);
	}
	return s;
}
function r(e, t, n) {
	let r = n.width / e.cw;
	return `translate(${(n.x - t.left - e.cw / 2).toFixed(1)}px, ${(n.y - t.top - e.ch / 2).toFixed(1)}px) rotate(${n.rot}deg) scale(${r.toFixed(3)})`;
}
//#endregion
export { n as cardAt, e as fanLayout, t as fanTransform, r as flightTransform };
