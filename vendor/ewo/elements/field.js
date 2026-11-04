import { EwoElement as e, css as t, define as n } from "./base.js";
//#region packages/elements/src/field.ts
var r = t`
  :host {
    --_h: 38px;
    --_font: var(--ewo-text-md);
    display: grid;
    gap: 6px;
    min-width: 0;
    color: var(--ewo-fg);
  }
  :host([size='sm']) { --_h: 32px; --_font: var(--ewo-text-sm); }
  :host([disabled]) { opacity: 0.5; }

  .top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  label { font-size: var(--ewo-text-sm); font-weight: 500; }
  :host([nolabel]) .top:not(.counting) { display: none; }
  :host([nolabel]) label {
    position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;
  }
  .count { margin-left: auto; font-family: var(--ewo-mono); font-size: var(--ewo-text-2xs); color: var(--ewo-fg-3); font-variant-numeric: tabular-nums; }
  .count:empty { display: none; }
  .count[data-near] { color: var(--ewo-warn); }

  .box {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--_h);
    padding: 0 12px;
    border: 1px solid var(--ewo-line-strong);
    border-radius: var(--ewo-r-sm);
    background: var(--ewo-bg);
    transition: border-color var(--ewo-dur-1) var(--ewo-ease);
    cursor: text;
  }
  :host([multiline]) .box { align-items: stretch; padding: 0; }
  .box:focus-within { border-color: var(--ewo-fg-2); outline: var(--ewo-focus); outline-offset: 1px; outline-color: color-mix(in oklab, var(--ewo-fg-2) 35%, transparent); }
  :host([error]:not([error=''])) .box { border-color: var(--ewo-bad); }
  @media (hover: hover) and (pointer: fine) {
    :host(:not([disabled])) .box:not(:focus-within):hover { border-color: color-mix(in oklab, var(--ewo-fg) 32%, transparent); }
  }

  input, textarea {
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    background: none;
    color: inherit;
    font: inherit;
    font-size: var(--_font);
    line-height: 1.4;
  }
  input { height: calc(var(--_h) - 2px); }
  textarea { padding: 9px 12px; resize: vertical; min-height: calc(var(--_h) * 2); overflow-y: auto; }
  :host([autogrow]) textarea { resize: none; overflow-y: hidden; }
  input::placeholder, textarea::placeholder { color: var(--ewo-fg-3); opacity: 1; }
  input:focus-visible, textarea:focus-visible { outline: none; }
  input[type='search']::-webkit-search-decoration { appearance: none; }
  @media (pointer: coarse) {
    input, textarea { font-size: max(16px, var(--_font)); }
  }

  ::slotted(svg) { display: block; flex: none; width: 16px; height: 16px; color: var(--ewo-fg-3); }
  slot[name]:not(.has) { display: none; }

  .hint, .error { margin: 0; font-size: 12.5px; line-height: 1.45; }
  .hint { color: var(--ewo-fg-3); }
  .error { color: var(--ewo-bad); }
  .hint:empty, .error:empty { display: none; }
`, i = 0, a = class extends e {
	static styles = [r];
	static formAssociated = !0;
	static observedAttributes = [
		"label",
		"value",
		"placeholder",
		"hint",
		"error",
		"type",
		"multiline",
		"rows",
		"maxlength",
		"counter",
		"name",
		"required",
		"disabled",
		"readonly",
		"autocomplete",
		"inputmode"
	];
	#e = this.attachInternals();
	#t = `ewo-field-${++i}`;
	#n = null;
	#r = "";
	#i = !1;
	#a = "";
	constructor() {
		super({
			mode: "open",
			delegatesFocus: !0
		}), this.root.innerHTML = `
      <div class="top"><label part="label" for="${this.#t}"></label><span class="count" aria-hidden="true"></span></div>
      <div class="box" part="box"><slot name="start"></slot><slot name="end"></slot></div>
      <p class="hint" part="hint" id="${this.#t}-hint"></p>
      <p class="error" part="error" id="${this.#t}-error" role="alert"></p>`;
		for (let e of this.root.querySelectorAll("slot[name]")) e.addEventListener("slotchange", () => e.classList.toggle("has", e.assignedNodes().length > 0));
		this.root.querySelector(".box").addEventListener("mousedown", (e) => {
			e.target !== this.#n && (e.preventDefault(), this.#n?.focus());
		});
	}
	connectedCallback() {
		this.#o();
	}
	attributeChangedCallback(e) {
		this.isConnected && (e === "value" && this.#i || this.#o());
	}
	get value() {
		return this.#n?.value ?? (this.#i ? this.#a : this.getAttribute("value") ?? "");
	}
	set value(e) {
		let t = e ?? "";
		this.#i = !0, this.#a = t, this.#r = t, this.#n && (this.#n.value !== t && (this.#n.value = t), this.#c(), this.#l());
	}
	get disabled() {
		return this.flag("disabled");
	}
	set disabled(e) {
		this.flag("disabled", e);
	}
	get required() {
		return this.flag("required");
	}
	set required(e) {
		this.flag("required", e);
	}
	get readonly() {
		return this.flag("readonly");
	}
	set readonly(e) {
		this.flag("readonly", e);
	}
	get multiline() {
		return this.flag("multiline");
	}
	set multiline(e) {
		this.flag("multiline", e);
	}
	get counter() {
		return this.flag("counter");
	}
	set counter(e) {
		this.flag("counter", e);
	}
	get nolabel() {
		return this.flag("nolabel");
	}
	set nolabel(e) {
		this.flag("nolabel", e);
	}
	get error() {
		return this.getAttribute("error") ?? "";
	}
	set error(e) {
		e ? this.setAttribute("error", e) : this.removeAttribute("error");
	}
	get form() {
		return this.#e.form;
	}
	get validity() {
		return this.#e.validity;
	}
	checkValidity() {
		return this.#e.checkValidity();
	}
	reportValidity() {
		return this.#e.reportValidity();
	}
	select() {
		this.#n?.select();
	}
	formResetCallback() {
		this.#i = !1, this.#o();
	}
	formDisabledCallback(e) {
		this.#n && (this.#n.disabled = e);
	}
	#o() {
		let e = this.multiline ? "textarea" : "input";
		if (!this.#n || this.#n.localName !== e) {
			let t = this.#n?.value, n = document.createElement(e);
			n.id = this.#t, n.part.add("control"), n.addEventListener("input", (e) => {
				e.stopPropagation(), this.#i = !0, this.#a = n.value, this.#c(), this.#l(), this.emit("input", { value: n.value });
			}), n.addEventListener("change", (e) => {
				e.stopPropagation(), this.#s();
			}), n instanceof HTMLInputElement && n.addEventListener("keydown", (e) => {
				e.key === "Enter" && !e.isComposing && this.#s();
			}), this.#n?.remove(), this.root.querySelector("slot[name=\"end\"]").before(n), this.#n = n, n.value = t ?? (this.#i ? this.#a : this.getAttribute("value") ?? ""), this.#r = n.value;
		}
		let t = this.#n;
		if (!this.#i) {
			let e = this.getAttribute("value") ?? "";
			t.value !== e && (t.value = e), this.#r = t.value;
		}
		t instanceof HTMLInputElement ? t.type = this.getAttribute("type") || "text" : t.rows = Number(this.getAttribute("rows")) || 3;
		for (let e of [
			"placeholder",
			"name",
			"autocomplete",
			"inputmode",
			"maxlength"
		]) {
			let n = this.getAttribute(e);
			n === null ? t.removeAttribute(e) : t.setAttribute(e, n);
		}
		t.required = this.required, t.disabled = this.disabled, t.readOnly = this.readonly, this.root.querySelector("label").textContent = this.getAttribute("label") ?? "";
		let n = this.root.querySelector(".hint"), r = this.root.querySelector(".error");
		n.textContent = this.getAttribute("hint") ?? "", r.textContent = this.error;
		let i = [n.textContent && n.id, this.error && r.id].filter(Boolean).join(" ");
		i ? t.setAttribute("aria-describedby", i) : t.removeAttribute("aria-describedby"), t.setAttribute("aria-invalid", String(!!this.error)), this.#c(), this.#l();
	}
	#s() {
		let e = this.value;
		e !== this.#r && (this.#r = e, this.emit("change", { value: e }));
	}
	#c() {
		let e = this.#n;
		e instanceof HTMLTextAreaElement && this.hasAttribute("autogrow") && (e.style.height = "auto", e.style.height = `${e.scrollHeight + 2}px`);
	}
	#l() {
		let e = this.#n;
		if (!e) return;
		this.#e.setFormValue(e.value), this.error ? this.#e.setValidity({ customError: !0 }, this.error, e) : e.validity.valid ? this.#e.setValidity({}) : this.#e.setValidity(e.validity, e.validationMessage, e);
		let t = this.root.querySelector(".count"), n = Number(this.getAttribute("maxlength")) || 0, r = this.counter && n > 0;
		t.textContent = r ? `${e.value.length} / ${n}` : "", t.toggleAttribute("data-near", r && e.value.length >= n * .9), this.root.querySelector(".top").classList.toggle("counting", r);
	}
};
n("ewo-field", a);
//#endregion
export { a as EwoField };
