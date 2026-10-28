//#region packages/elements/src/scroll-lock.ts
var e = 0, t;
function n() {
	e++ === 0 && (t = r());
	let n = !0;
	return () => {
		n && (n = !1, --e === 0 && (t?.(), t = void 0));
	};
}
function r() {
	let e = document.documentElement, t = getComputedStyle(e), n = t.overflowX === "visible" && t.overflowY === "visible" ? document.body : e, r = innerWidth - e.clientWidth, { overflow: i, paddingRight: a } = n.style, o = parseFloat(getComputedStyle(n).paddingRight) || 0;
	return n.style.overflow = "hidden", r > 0 && (n.style.paddingRight = `${o + r}px`), () => {
		n.style.overflow = i, n.style.paddingRight = a;
	};
}
//#endregion
export { n as lockScroll };
