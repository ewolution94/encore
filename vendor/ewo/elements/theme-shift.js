import { css as e, reducedMotion as t } from "./base.js";
//#region packages/elements/src/theme-shift.ts
var n = 150, r = 80, i = 220, a, o = null, s = [], c = "idle", l;
function u() {
	return t() || document.documentElement.dataset.motion === "reduced" || document.hidden;
}
function d(e) {
	if (u()) {
		h(), g(e);
		return;
	}
	if (s.push(e), c !== "in") {
		if (c === "hold") {
			h(), p();
			return;
		}
		f();
	}
}
function f() {
	c = "in", clearTimeout(l), o || (a ??= e`
      .ewo-theme-veil {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        pointer-events: none;
        background-color: color-mix(in srgb, var(--ewo-bg, Canvas) 45%, transparent);
        opacity: 0;
        -webkit-backdrop-filter: blur(0);
        backdrop-filter: blur(0);
        transition-property: opacity, -webkit-backdrop-filter, backdrop-filter, background-color;
        transition-duration: ${i}ms;
        transition-timing-function: var(--ewo-ease, cubic-bezier(0.22, 1, 0.36, 1));
      }
      .ewo-theme-veil[data-on] {
        opacity: 1;
        -webkit-backdrop-filter: blur(14px);
        backdrop-filter: blur(14px);
        transition-duration: ${n}ms;
      }
    `, document.adoptedStyleSheets.includes(a) || (document.adoptedStyleSheets = [...document.adoptedStyleSheets, a]), o = document.createElement("div"), o.className = "ewo-theme-veil", o.setAttribute("aria-hidden", "true"), document.body.append(o), o.getBoundingClientRect()), o.toggleAttribute("data-on", !0), document.documentElement.classList.add("ewo-theme-shift"), l = setTimeout(() => {
		h(), p();
	}, n);
}
function p() {
	c = "hold", clearTimeout(l), l = setTimeout(() => {
		c = "out", o?.removeAttribute("data-on"), l = setTimeout(m, i);
	}, r);
}
function m() {
	c = "idle", o?.remove(), o = null, document.documentElement.classList.remove("ewo-theme-shift");
}
function h() {
	let e = s;
	s = [];
	for (let t of e) g(t);
}
function g(e) {
	try {
		e();
	} catch (e) {
		reportError(e);
	}
}
//#endregion
export { d as themeShift };
