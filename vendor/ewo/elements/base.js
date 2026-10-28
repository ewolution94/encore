//#region packages/elements/src/base.ts
function e(e, ...t) {
	let n = new CSSStyleSheet();
	return n.replaceSync(String.raw({ raw: e }, ...t)), n;
}
var t = e`
  :host {
    box-sizing: border-box;
    font-family: var(--ewo-sans);
    -webkit-tap-highlight-color: transparent;
  }
  :host([hidden]) { display: none !important; }
  *, *::before, *::after { box-sizing: inherit; }
  :focus-visible { outline: var(--ewo-focus); outline-offset: 2px; }
  /* manipulation: no double-tap zoom on a control tapped twice quickly (iOS zoomed the page on the
     emblem maker's arrows, 2026-10-08); panning and pinch zoom still work. */
  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; touch-action: manipulation; }
  /* Tap feedback from pressFeedback() (press.ts) reaches Folio's own buttons too; the tokens come
     from the page, with the calm values as fallbacks. */
  [data-pressed] { opacity: var(--ewo-press-opacity, 0.82); transition: scale var(--ewo-press-in, 70ms), opacity var(--ewo-press-in, 70ms) !important; }
  [data-pressed='box'] { scale: var(--ewo-press-scale, 0.96); }
  [data-pressed='large'] { scale: var(--ewo-press-scale-large, 0.985); }
  [data-released] { transition: scale var(--ewo-press-out, 220ms), opacity var(--ewo-press-out, 220ms) !important; }
  @media (prefers-reduced-motion: reduce) { [data-pressed] { scale: none; } }
`, n = class extends HTMLElement {
	static styles = [];
	root;
	constructor(e = { mode: "open" }) {
		super(), this.root = this.attachShadow(e), this.root.adoptedStyleSheets = [t, ...this.constructor.styles];
	}
	flag(e, t) {
		return t !== void 0 && this.toggleAttribute(e, t), this.hasAttribute(e);
	}
	emit(e, t, n = !1) {
		return this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0,
			cancelable: n
		}));
	}
};
function r() {
	return document.documentElement.lang.toLowerCase().startsWith("de") ? "de" : "en";
}
var i = /* @__PURE__ */ new Set(), a;
function o(e) {
	return a ??= new MutationObserver(() => i.forEach((e) => e())), i.size || a.observe(document.documentElement, {
		attributes: !0,
		attributeFilter: ["lang"]
	}), i.add(e), () => {
		i.delete(e), i.size || a?.disconnect();
	};
}
function s(e, t) {
	customElements.get(e) || customElements.define(e, t);
}
var c = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function l() {
	let e = document.documentElement.dataset.theme;
	return e === "light" || e === "dark" ? e : matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function u(e) {
	let t = matchMedia("(prefers-color-scheme: light)"), n = new MutationObserver(e);
	return n.observe(document.documentElement, {
		attributes: !0,
		attributeFilter: ["data-theme"]
	}), t.addEventListener("change", e), () => {
		n.disconnect(), t.removeEventListener("change", e);
	};
}
//#endregion
export { n as EwoElement, e as css, s as define, l as effectiveTheme, t as hostBase, o as onPageLanguage, u as onThemeChange, r as pageLanguage, c as reducedMotion };
