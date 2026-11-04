import { EwoElement as e, css as t, define as n, pageLanguage as r } from "./base.js";
//#region packages/elements/src/table.ts
var i = t`
  :host { display: block; min-width: 0; }
  .scroll { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; }
  .scroll:focus-visible { outline: var(--ewo-focus); outline-offset: -2px; }
`, a = "\n@layer ewo {\n  ewo-table > table {\n    width: 100%;\n    border-collapse: collapse;\n    font-size: var(--ewo-text-md);\n    color: var(--ewo-fg);\n    font-variant-numeric: tabular-nums;\n  }\n  ewo-table > table > * > tr > :is(th, td) {\n    padding: 9px 14px;\n    border-top: 1px solid var(--ewo-line);\n    text-align: start;\n    vertical-align: middle;\n    font-weight: 400;\n  }\n  ewo-table > table > * > tr > th[scope='row'] { font-weight: 500; }\n  ewo-table > table > thead > tr > th {\n    padding-block: 12px 8px;\n    border-top: 0;\n    font: 500 var(--ewo-text-2xs) / 1.3 var(--ewo-mono);\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    color: var(--ewo-fg-3);\n    white-space: nowrap;\n  }\n  ewo-table > table > thead > tr > th small {\n    display: block;\n    font-size: inherit;\n    letter-spacing: 0.02em;\n    text-transform: none;\n  }\n  ewo-table > table > tbody:first-child > tr:first-child > * { border-top: 0; }\n  ewo-table > table > * > tr[data-group] > * {\n    padding-block: 6px;\n    background: var(--ewo-bg-sunk);\n    font: 500 var(--ewo-text-2xs) / 1.3 var(--ewo-mono);\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    color: var(--ewo-fg-3);\n  }\n  ewo-table > table > * > tr > [data-num] {\n    font-family: var(--ewo-mono);\n    font-size: var(--ewo-text-sm);\n    text-align: end;\n    white-space: nowrap;\n  }\n  ewo-table > table > caption {\n    caption-side: top;\n    padding: 0 14px 8px;\n    text-align: start;\n    font-size: var(--ewo-text-sm);\n    font-weight: 600;\n  }\n  ewo-table[density='compact'] > table > * > tr > :is(th, td) { padding: 6px 10px; }\n  ewo-table[density='compact'] > table > thead > tr > th { padding-block: 10px 6px; }\n  ewo-table[nowrap] > table > * > tr > :is(th, td) { white-space: nowrap; }\n  ewo-table[sticky] > table > * > tr > :first-child {\n    position: sticky;\n    left: 0;\n    z-index: 1;\n    background: var(--ewo-table-bg, var(--ewo-bg-raised));\n  }\n  ewo-table[sticky] > table > * > tr[data-group] > :first-child { background: var(--ewo-bg-sunk); }\n  @media (hover: hover) and (pointer: fine) {\n    ewo-table[hover] > table > tbody > tr:not([data-group]):hover > * { background: var(--ewo-fill); }\n  }\n}\n", o, s = /* @__PURE__ */ new WeakSet(), c = class extends e {
	static styles = [i];
	static observedAttributes = ["label"];
	#e;
	#t = new ResizeObserver(() => this.#r());
	constructor() {
		super(), this.root.innerHTML = "<div class=\"scroll\" part=\"scroll\"><slot></slot></div>", this.#e = this.root.querySelector(".scroll"), this.root.querySelector("slot").addEventListener("slotchange", () => this.#n());
	}
	connectedCallback() {
		let e = this.getRootNode();
		!s.has(e) && "adoptedStyleSheets" in e && (o || (o = new CSSStyleSheet(), o.replaceSync(a)), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o], s.add(e)), this.#n();
	}
	disconnectedCallback() {
		this.#t.disconnect();
	}
	attributeChangedCallback() {
		this.#r();
	}
	#n() {
		this.#t.disconnect(), this.#t.observe(this.#e);
		let e = this.querySelector(":scope > table");
		e && this.#t.observe(e), this.#r();
	}
	#r() {
		let e = this.#e, t = this.getAttribute("label"), n = this.querySelector(":scope > table > caption")?.textContent?.trim();
		e.scrollWidth > e.clientWidth + 1 ? (e.tabIndex = 0, e.setAttribute("role", "region"), e.setAttribute("aria-label", t || n || (r() === "de" ? "Tabelle" : "Table"))) : (e.removeAttribute("tabindex"), e.removeAttribute("role"), e.removeAttribute("aria-label"));
	}
};
n("ewo-table", c);
//#endregion
export { c as EwoTable };
