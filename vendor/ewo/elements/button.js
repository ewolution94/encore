import { EwoElement as e, css as t, define as n } from "./base.js";
//#region packages/elements/src/button.ts
var r = t`
  :host {
    --_h: 34px;
    --_pad: 0 14px;
    --_font: var(--ewo-text-sm);
    --_bg: var(--ewo-bg-raised);
    --_bg-hover: color-mix(in oklab, var(--ewo-fg) 6%, var(--ewo-bg-raised));
    --_line: var(--ewo-line-strong);
    position: relative;
    display: inline-flex;
    vertical-align: middle;
    border-radius: var(--ewo-r-pill);
    color: var(--ewo-fg);
  }
  :host([size='sm']) { --_h: 28px; --_pad: 0 11px; --_font: var(--ewo-text-xs); }
  :host([size='lg']) { --_h: 44px; --_pad: 0 20px; --_font: var(--ewo-text-md); }
  :host([stretch]) { display: flex; }
  :host([variant='primary']) {
    --_bg: var(--ewo-invert);
    --_bg-hover: color-mix(in oklab, var(--ewo-invert) 84%, var(--ewo-bg));
    --_line: transparent;
    color: var(--ewo-invert-ink);
  }
  :host([variant='quiet']) {
    --_bg: transparent;
    --_bg-hover: var(--ewo-fill-2);
    --_line: transparent;
    color: var(--ewo-fg-2);
  }
  :host([variant='danger']) {
    --_line: color-mix(in oklab, var(--ewo-bad) 45%, transparent);
    --_bg-hover: color-mix(in oklab, var(--ewo-bad) 8%, var(--ewo-bg-raised));
    color: var(--ewo-bad);
  }
  :host([disabled]) { opacity: 0.4; pointer-events: none; }

  .b {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-width: var(--_h);
    height: var(--_h);
    padding: var(--_pad);
    border: 1px solid var(--_line);
    border-radius: inherit;
    background: var(--_bg);
    color: inherit;
    font-size: var(--_font);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
    transition: background-color var(--ewo-dur-1) var(--ewo-ease), border-color var(--ewo-dur-1) var(--ewo-ease);
  }
  :host([icon]) .b { width: var(--_h); padding: 0; }
  :host(:not([icon])) .b { min-width: calc(var(--_h) * 2); }
  :host([variant='quiet']:not([icon])) .b { min-width: 0; }
  @media (hover: hover) and (pointer: fine) {
    .b:hover { background: var(--_bg-hover); }
  }
  ::slotted(svg), ::slotted(img) { display: block; flex: none; width: 1.15em; height: 1.15em; }
  :host([icon]) ::slotted(svg), :host([icon]) ::slotted(img) { width: 16px; height: 16px; }
  :host([icon][size='sm']) ::slotted(svg), :host([icon][size='sm']) ::slotted(img) { width: 14px; height: 14px; }
  :host([icon][size='lg']) ::slotted(svg), :host([icon][size='lg']) ::slotted(img) { width: 20px; height: 20px; }
  slot[name]:not(.has) { display: none; }
`, i = class extends e {
	static styles = [r];
	static formAssociated = !0;
	static observedAttributes = [
		"href",
		"target",
		"download",
		"label",
		"disabled"
	];
	#e = this.attachInternals();
	#t = null;
	constructor() {
		super({
			mode: "open",
			delegatesFocus: !0
		}), this.addEventListener("click", (e) => {
			if (this.disabled) {
				e.stopImmediatePropagation(), e.preventDefault();
				return;
			}
			let t = this.#e.form;
			t && !this.href && (this.type === "submit" ? HTMLFormElement.prototype.requestSubmit.call(t) : this.type === "reset" && HTMLFormElement.prototype.reset.call(t));
		});
	}
	connectedCallback() {
		this.#n();
	}
	attributeChangedCallback() {
		this.isConnected && this.#n();
	}
	get variant() {
		return this.getAttribute("variant") ?? "default";
	}
	set variant(e) {
		this.setAttribute("variant", e);
	}
	get disabled() {
		return this.flag("disabled");
	}
	set disabled(e) {
		this.flag("disabled", e);
	}
	get icon() {
		return this.flag("icon");
	}
	set icon(e) {
		this.flag("icon", e);
	}
	get stretch() {
		return this.flag("stretch");
	}
	set stretch(e) {
		this.flag("stretch", e);
	}
	get type() {
		let e = this.getAttribute("type");
		return e === "submit" || e === "reset" ? e : "button";
	}
	set type(e) {
		this.setAttribute("type", e);
	}
	get href() {
		return this.getAttribute("href") ?? "";
	}
	set href(e) {
		e ? this.setAttribute("href", e) : this.removeAttribute("href");
	}
	get label() {
		return this.getAttribute("label") ?? "";
	}
	set label(e) {
		this.setAttribute("label", e);
	}
	get form() {
		return this.#e.form;
	}
	formDisabledCallback(e) {
		this.disabled = e;
	}
	#n() {
		let e = this.href && !this.disabled ? "a" : "button";
		if (!this.#t || this.#t.localName !== e) {
			let t = document.createElement(e);
			t.className = "b", t.part.add("control"), t.innerHTML = "<slot name=\"start\"></slot><slot></slot><slot name=\"end\"></slot>";
			for (let e of t.querySelectorAll("slot[name]")) e.addEventListener("slotchange", () => e.classList.toggle("has", e.assignedNodes().length > 0));
			this.#t?.remove(), this.root.append(t), this.#t = t;
		}
		let t = this.#t;
		if (t instanceof HTMLAnchorElement) {
			t.href = this.href;
			for (let e of ["target", "download"]) {
				let n = this.getAttribute(e);
				n === null ? t.removeAttribute(e) : t.setAttribute(e, n);
			}
			this.getAttribute("target") === "_blank" ? t.rel = "noopener" : t.removeAttribute("rel");
		} else t.type = "button", t.disabled = this.disabled;
		this.label ? t.setAttribute("aria-label", this.label) : t.removeAttribute("aria-label");
	}
};
n("ewo-button", i);
//#endregion
export { i as EwoButton };
