//#region packages/elements/src/tile-grid-math.ts
var e = 200, t = (e, t) => e[0] < t[0] + t[2] && t[0] < e[0] + e[2] && e[1] < t[1] + t[3] && t[1] < e[1] + e[3], n = (e, t) => e[0] >= 1 && e[1] >= 1 && e[2] >= 1 && e[3] >= 1 && e[0] + e[2] - 1 <= t && e[1] + e[3] - 1 <= 200, r = (e) => Object.values(e).reduce((e, t) => Math.max(e, t[1] + t[3] - 1), 0);
function i(e, n, r) {
	return Object.keys(e).filter((i) => i !== n && t(e[i], r));
}
var a = (e, t) => e[0] === t[0] && e[1] === t[1] && e[2] === t[2] && e[3] === t[3], o = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, [...t]])), s = (e, t) => Object.keys(e).sort((n, r) => e[n][1] - e[r][1] || e[n][0] - e[r][0] || (n === t ? -1 : +(r === t)));
function c(e, n) {
	let r = {};
	for (let i of s(e, n)) {
		let n = [...e[i]];
		for (; n[1] > 1;) {
			let e = [
				n[0],
				n[1] - 1,
				n[2],
				n[3]
			];
			if (Object.values(r).some((n) => t(n, e))) break;
			n[1]--;
		}
		r[i] = n;
	}
	return Object.fromEntries(Object.keys(e).map((e) => [e, r[e]]));
}
function l(e, n, r = 0) {
	if (r > 400) return;
	let i = e[n];
	for (let a of s(e)) a !== n && t(e[a], i) && (e[a] = [
		e[a][0],
		i[1] + i[3],
		e[a][2],
		e[a][3]
	], l(e, a, r + 1));
}
function u(e, t, n, r, i) {
	let o = i.compact ? c(t, n) : t;
	return {
		tiles: o,
		how: r,
		moved: Object.keys(o).filter((t) => t !== n && e[t] && !a(e[t], o[t]))
	};
}
var d = (e) => e[2] * e[3], f = (e, t) => Math.max(0, Math.min(e[0] + e[2], t[0] + t[2]) - Math.max(e[0], t[0])) * Math.max(0, Math.min(e[1] + e[3], t[1] + t[3]) - Math.max(e[1], t[1])), p = (e, t, r) => t.every((t) => n(e[t], r) && !i(e, t, e[t]).length);
function m(e, t, n, r) {
	let a = e[t], s = o(e);
	s[t] = [...n];
	let c = i(e, t, n);
	if (!c.length) return u(e, s, t, "free", r);
	if (a && a[2] === n[2] && a[3] === n[3]) {
		let i = a[0] - n[0], l = a[1] - n[1], m = o(s);
		for (let t of c) m[t] = [
			e[t][0] + i,
			e[t][1] + l,
			e[t][2],
			e[t][3]
		];
		if (p(m, c, r.columns)) return u(e, m, t, "swap", r);
		if (c.length === 1) {
			let i = e[c[0]];
			if (f(i, n) * 2 >= Math.min(d(i), d(n))) {
				let s = o(e);
				if (s[t] = [
					i[0],
					i[1],
					n[2],
					n[3]
				], s[c[0]] = [
					a[0],
					a[1],
					i[2],
					i[3]
				], p(s, [t, c[0]], r.columns)) return u(e, s, t, "swap", r);
			}
		}
	}
	return l(s, t), u(e, s, t, "push", r);
}
function h(e, t, n, r, i, a) {
	let o = e[t], s = Math.max(i[0], Math.min(a.columns - o[0] + 1, n)), c = Math.max(i[1], Math.min(200 - o[1] + 1, r));
	return m(e, t, [
		o[0],
		o[1],
		s,
		c
	], a);
}
function g(e, t, r, o, s) {
	let c = e[t], l = [
		c[0] + r,
		c[1] + o,
		c[2],
		c[3]
	];
	if (!n(l, s.columns)) return null;
	let u = m(e, t, l, s);
	if (u.how === "push") {
		let a = i(e, t, l).map((t) => e[t]).sort((e, t) => r ? r > 0 ? e[0] - t[0] : t[0] + t[2] - (e[0] + e[2]) : o > 0 ? e[1] - t[1] : t[1] + t[3] - (e[1] + e[3]))[0], d = r ? [
			r > 0 ? a[0] + a[2] - c[2] : a[0],
			c[1],
			c[2],
			c[3]
		] : [
			c[0],
			o > 0 ? a[1] + a[3] - c[3] : a[1],
			c[2],
			c[3]
		];
		if ((r ? Math.sign(d[0] - c[0]) === r : Math.sign(d[1] - c[1]) === o) && n(d, s.columns)) {
			let n = m(e, t, d, s);
			n.how === "swap" && (u = n);
		}
	}
	return a(u.tiles[t], c) && !u.moved.length ? null : u;
}
function _(e, t) {
	let n = {};
	for (let r of s(e)) n[r] = y(n, e[r][2], e[r][3], t);
	return Object.fromEntries(Object.keys(e).map((e) => [e, n[e]]));
}
var v = (e, t) => Object.entries(_(e, t)).some(([t, n]) => !a(n, e[t]));
function y(e, n, i, a) {
	let o = Math.min(n, a), s = r(e) + 1;
	for (let n = 1; n <= s; n++) for (let r = 1; r + o - 1 <= a; r++) {
		let a = [
			r,
			n,
			o,
			i
		];
		if (!Object.values(e).some((e) => t(e, a))) return a;
	}
	return [
		1,
		s,
		o,
		i
	];
}
function b(e, t, n, r, i) {
	return [Math.max(1, Math.min(i - e[2] + 1, e[0] + Math.round(t / r.x))), Math.max(1, Math.min(200 - e[3] + 1, e[1] + Math.round(n / r.y)))];
}
function x(e, t, n, r) {
	return [Math.max(1, e[2] + Math.round(t / r.x)), Math.max(1, e[3] + Math.round(n / r.y))];
}
//#endregion
export { e as MAX_ROWS, m as arrange, c as compact, y as firstFree, n as fits, v as hasGaps, i as inTheWay, t as overlaps, _ as pack, h as resize, r as rowsOf, b as snapMove, x as snapSize, g as step };
