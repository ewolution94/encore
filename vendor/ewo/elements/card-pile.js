//#region packages/elements/src/card-pile.ts
var e = (e, t, n) => ((e - t) % n + n) % n;
function t(t, n, r) {
	let i = e(t, Math.max(0, n), r);
	return i === 0 ? 90 : 180 + i * 180 / r;
}
function n(e, t = 0) {
	let n = t * 7919;
	for (let t of e) n = n * 31 + t.charCodeAt(0) | 0;
	return Number((Math.abs(n) % 2200 / 100 - 11).toFixed(1));
}
var r = (e, t, n = e > 600 ? 120 : 100, r = 1.4) => Math.round(Math.min(n, e * .27, t * .5 / r));
function i(e, t, n = 1.4) {
	let r = e * Math.PI / 180;
	return {
		dx: Math.cos(r) * t * .36,
		dy: Math.sin(r) * t * n * .27
	};
}
function a(e, t, n) {
	let r = e * Math.PI / 180;
	return {
		dx: Math.cos(r) * t * .75,
		dy: Math.sin(r) * n * .75
	};
}
function o(e, t, n) {
	let r = t * 2654435761;
	for (let t of e) r = r * 31 + t.charCodeAt(0) | 0;
	let i = Math.abs(r);
	return {
		dx: (i % 1e3 / 1e3 - .5) * n * .16,
		dy: ((i >> 10) % 1e3 / 1e3 - .5) * n * .12,
		r: (i >> 20) % 1600 / 100 - 8
	};
}
//#endregion
export { n as cardTwist, r as pileCardWidth, e as placeOf, t as seatAngle, o as stackPlace, a as sweepTo, i as trickSlot };
