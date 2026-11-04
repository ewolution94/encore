//#region packages/elements/src/config-client.ts
var e;
function t(t = document) {
	if (e && t === document) return e;
	let n = {};
	try {
		let e = JSON.parse(t.getElementById("ewo-config")?.textContent ?? "{}");
		e && typeof e == "object" && !Array.isArray(e) && (n = e);
	} catch {}
	let r = Object.freeze(n);
	return t === document && (e = r), r;
}
function n(e, n) {
	let r = t()[e];
	return n(r) ? r : void 0;
}
function r(e, n, r, i) {
	if (r.includes(e)) return e;
	let a = t()[n];
	return r.includes(a) ? a : i;
}
//#endregion
export { n as configValue, r as preferred, t as readConfig };
