//#region packages/elements/src/modal-focus.ts
var e = !1, t = null, n = !1;
function r() {
	n || (n = !0, addEventListener("keydown", (t) => !t.metaKey && !t.ctrlKey && !t.altKey && (e = !0), !0), addEventListener("pointerdown", () => e = !1, !0), addEventListener("click", (e) => {
		let n = e.composedPath().find((e) => e instanceof HTMLElement && e.matches("button, a[href], summary, [role='button'], [tabindex]"));
		n && (t = {
			el: n,
			at: performance.now()
		});
	}, !0));
}
var i = () => e;
function a() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e && e !== document.body ? e : null;
}
function o() {
	return a() ?? (t && performance.now() - t.at < 1e3 ? t.el : null);
}
function s(e, t, n) {
	let r = a();
	r && (r === n || e.contains(r) || t.contains(r)) && r.blur();
}
function c(e, t, n) {
	if (!e?.isConnected) return;
	let r = a();
	(!r || r === t) && e.focus({ focusVisible: !n });
}
//#endregion
export { a as deepActive, i as lastInputWasKey, s as letGo, o as openerNow, c as returnFocus, r as trackInput };
