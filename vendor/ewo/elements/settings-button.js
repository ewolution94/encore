import { EwoElement as e, css as t, define as n, onPageLanguage as r, pageLanguage as i } from "./base.js";
//#region packages/elements/src/settings-button.ts
var a = "\n  <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"\n    stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\n    <path d=\"M14 17H5\" /><path d=\"M19 7h-9\" /><circle cx=\"17\" cy=\"17\" r=\"3\" /><circle cx=\"7\" cy=\"7\" r=\"3\" />\n  </svg>", o = t`
  :host { display: inline-flex; flex: none; vertical-align: middle; }
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 38px;
    height: 38px;
    padding: 0 10px;
    border-radius: var(--ewo-r-pill);
    color: var(--ewo-fg-2);
    transition:
      background-color 160ms var(--ewo-ease),
      color 160ms var(--ewo-ease),
      transform 160ms var(--ewo-ease);
  }
  button:hover { background: var(--ewo-fill-2); color: var(--ewo-fg); }
  button:active { transform: scale(0.94); }
  svg { flex: none; }
  [part='label'] { display: none; font-size: var(--ewo-text-sm); font-weight: 500; white-space: nowrap; }
  :host([show-label]) button { padding: 0 14px 0 12px; }
  :host([show-label]) [part='label'] { display: inline; }
  @media (max-width: 640px) {
    :host([show-label]) button { padding: 0 10px; }
    :host([show-label]) [part='label'] { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    button { transition: none; }
    button:active { transform: none; }
  }
`, s = class extends e {
	static styles = [o];
	static observedAttributes = ["label"];
	#e;
	#t;
	constructor() {
		super(), this.root.innerHTML = `<button type="button" part="button">${a}<span part="label"></span></button>`, this.#e = this.root.querySelector("button"), this.#t = this.root.querySelector("[part=\"label\"]");
	}
	#n;
	connectedCallback() {
		this.#n = r(() => this.#r()), this.#r();
	}
	disconnectedCallback() {
		this.#n?.();
	}
	attributeChangedCallback() {
		this.#r();
	}
	focus(e) {
		this.#e.focus(e);
	}
	#r() {
		let e = this.getAttribute("label") || (i() === "de" ? "Einstellungen" : "Settings");
		this.#e.setAttribute("aria-label", e), this.#e.title = e, this.#t.textContent = e;
	}
};
n("ewo-settings-button", s);
//#endregion
export { s as EwoSettingsButton };
