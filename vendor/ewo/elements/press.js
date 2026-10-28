//#region packages/elements/src/press.ts
var e = [
	"button",
	"a[href]",
	"label",
	"summary",
	"select",
	"input:is([type='checkbox'], [type='radio'], [type='button'], [type='submit'], [type='reset'])",
	"[role='button']",
	"[role='radio']",
	"[role='tab']",
	"[role='switch']",
	"[role='checkbox']",
	"[role='option']",
	"[role='menuitem']",
	"[data-press]"
].join(", "), t = 120, n = 40, r = 450, i = !1, a = !1;
function o(e = {}) {
	if (document.documentElement.dataset.ewoPress = e.preset ?? "calm", i) return;
	i = !0, d();
	let a = null, o = (e) => {
		e.el.isConnected && (e.shown = !0, e.since = performance.now(), e.el.removeAttribute("data-released"), e.el.setAttribute("data-pressed", c(e.el)));
	}, l = (e) => {
		let t = e.el;
		t.hasAttribute("data-pending") || (t.removeAttribute("data-pressed"), t.setAttribute("data-released", ""), window.setTimeout(() => {
			t.hasAttribute("data-pressed") || t.removeAttribute("data-released");
		}, r));
	};
	document.addEventListener("pointerdown", (e) => {
		if (e.pointerType === "mouse" || !e.isPrimary) return;
		let t = s(e);
		if (a && (clearTimeout(a.timer), a.shown && l(a)), a = null, !t) return;
		let r = {
			el: t,
			since: 0,
			shown: !1,
			timer: 0
		};
		r.timer = window.setTimeout(() => o(r), n), a = r;
	}, {
		capture: !0,
		passive: !0
	}), document.addEventListener("pointerup", (e) => {
		if (!a || e.pointerType === "mouse") return;
		let n = a;
		a = null, clearTimeout(n.timer), n.shown || o(n);
		let r = Math.max(0, t - (performance.now() - n.since));
		window.setTimeout(() => l(n), r);
	}, {
		capture: !0,
		passive: !0
	}), document.addEventListener("pointercancel", () => {
		a &&= (clearTimeout(a.timer), a.shown && !a.el.hasAttribute("data-pending") && (a.el.removeAttribute("data-pressed"), a.el.removeAttribute("data-released")), null);
	}, {
		capture: !0,
		passive: !0
	});
}
function s(t) {
	for (let n of t.composedPath()) if (n instanceof Element && n.matches(e)) return n.closest("[data-press='off'], [data-press='own']") || n.matches(":disabled, [aria-disabled=\"true\"], [data-pending]") ? null : n;
	return null;
}
function c(e) {
	if (getComputedStyle(e).display === "inline") return "inline";
	let t = e.getBoundingClientRect();
	return t.width > 240 || t.height > 120 ? "large" : "box";
}
function l(e) {
	d(), e.removeAttribute("data-released"), e.hasAttribute("data-pressed") || e.setAttribute("data-pressed", c(e));
}
function u(e) {
	e.hasAttribute("data-pressed") && (e.removeAttribute("data-pressed"), e.setAttribute("data-released", ""), window.setTimeout(() => {
		e.hasAttribute("data-pressed") || e.removeAttribute("data-released");
	}, r));
}
function d() {
	if (a) return;
	a = !0;
	let e = new CSSStyleSheet();
	e.replaceSync(f), document.adoptedStyleSheets = [...document.adoptedStyleSheets, e];
}
var f = "\n@layer ewo-press {\n  :root {\n    --ewo-press-scale: 0.96;\n    --ewo-press-scale-large: 0.985;\n    --ewo-press-opacity: 0.82;\n    --ewo-press-in: 70ms cubic-bezier(0.2, 0, 0, 1);\n    --ewo-press-out: 220ms cubic-bezier(0.2, 0, 0, 1);\n  }\n  /* The games' preset, as the user tuned it on Schätzle (2026-10-08: \"slightly\" less bouncy than\n     0.9 and an overshoot of 1.8). */\n  :root[data-ewo-press='lively'] {\n    --ewo-press-scale: 0.92;\n    --ewo-press-scale-large: 0.975;\n    --ewo-press-opacity: 0.9;\n    --ewo-press-out: 380ms cubic-bezier(0.34, 1.45, 0.5, 1);\n  }\n  /* !important on the transitions only: a control's own unlayered transition would otherwise win over\n     this layer, and the press then snapped instead of easing and bouncing back (Schätzle's buttons,\n     2026-10-08). A layered !important beats an unlayered normal declaration. They last only while\n     pressed or releasing. */\n  [data-pressed] {\n    transition: scale var(--ewo-press-in), opacity var(--ewo-press-in) !important;\n    opacity: var(--ewo-press-opacity);\n  }\n  [data-pressed='box'] { scale: var(--ewo-press-scale); }\n  [data-pressed='large'] { scale: var(--ewo-press-scale-large); }\n  [data-released] { transition: scale var(--ewo-press-out), opacity var(--ewo-press-out) !important; }\n  @media (prefers-reduced-motion: reduce) {\n    [data-pressed] { scale: none; }\n  }\n}\n";
//#endregion
export { f as PRESS_CSS, l as holdPress, o as pressFeedback, u as releasePress };
