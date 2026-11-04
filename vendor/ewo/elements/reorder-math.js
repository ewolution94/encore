//#region packages/elements/src/reorder-math.ts
function e(e, t, n) {
	let r = e.slice(), [i] = r.splice(t, 1);
	return r.splice(Math.max(0, Math.min(n, r.length)), 0, i), r;
}
function t(e, t, n) {
	let r = e[t], i = r.top + n, a = i + r.height, o = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e[n].top + e[n].height / 2;
		(n < t ? i > r : n > t && a > r) && o++;
	}
	return o;
}
function n(e, t) {
	let n = e[t], r = e[e.length - 1];
	return [e[0].top - n.top, r.top + r.height - (n.top + n.height)];
}
function r(e, t, n, r) {
	if (r === t) return 0;
	let i = e[t], a = e[t + 1] ?? e[t - 1], o = a ? Math.max(0, t + 1 < e.length ? a.top - (i.top + i.height) : i.top - (a.top + a.height)) : 0, s = i.height + o;
	return t < n && r > t && r <= n ? -s : n < t && r >= n && r < t ? s : 0;
}
//#endregion
export { n as dragRange, t as dropIndex, e as moveItem, r as shiftOf };
