//#region packages/elements/src/slider-scale.ts
function e(e) {
	let t = String(e);
	return t.includes("e-") ? Number(t.split("e-")[1]) : t.includes(".") ? t.split(".")[1].length : 0;
}
function t(e, t, n) {
	let r = Number.isFinite(e) ? e : 0;
	return {
		min: r,
		max: Number.isFinite(t) && t > r ? t : r + 100,
		step: Number.isFinite(n) && n > 0 ? n : 1
	};
}
function n(t, { min: n, max: r, step: i }) {
	if (!Number.isFinite(t)) return n;
	let a = Math.floor((r - n) / i + 1e-9), o = Math.min(a, Math.max(0, Math.round((t - n) / i)));
	return Number((n + o * i).toFixed(e(i)));
}
function r(e, { min: t, max: n }) {
	return Math.min(1, Math.max(0, (e - t) / (n - t)));
}
function i(e, t) {
	return n(t.min + Math.min(1, Math.max(0, e)) * (t.max - t.min), t);
}
function a({ min: e, max: t, step: n }) {
	return Math.floor((t - e) / n + 1e-9);
}
function o(e) {
	let t = (e.max - e.min) / 10;
	return Math.max(e.step, Math.round(t / e.step) * e.step);
}
//#endregion
export { e as decimals, r as fractionOf, o as pageStep, t as scaleOf, n as snap, a as stepCount, i as valueAt };
