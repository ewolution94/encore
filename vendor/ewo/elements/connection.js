import { EwoElement as e, css as t, define as n, onPageLanguage as r, pageLanguage as i } from "./base.js";
//#region packages/elements/src/connection.ts
var a = {
	de: {
		connecting: "Verbinde …",
		reconnecting: "Verbindung wird wiederhergestellt …",
		back: "Wieder verbunden"
	},
	en: {
		connecting: "Connecting …",
		reconnecting: "Reconnecting …",
		back: "Connected again"
	}
}, o = {
	connecting: 400,
	reconnecting: 1500,
	online: 0
}, s = 1400, c = t`
  :host {
    position: fixed;
    top: var(--ewo-connection-top, calc(env(safe-area-inset-top, 0px) + 12px));
    left: 50%;
    z-index: var(--ewo-connection-z, 50);
    translate: -50% -8px;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity var(--ewo-dur-2, 180ms) var(--ewo-ease, ease),
      translate var(--ewo-dur-2, 180ms) var(--ewo-ease, ease);
  }
  :host([data-show]) { opacity: 1; translate: -50% 0; }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    max-width: calc(100vw - 32px);
    padding: 7px 14px;
    border-radius: var(--ewo-r-pill, 999px);
    background: var(--ewo-connection-bg, var(--ewo-fg));
    color: var(--ewo-connection-fg, var(--ewo-bg));
    font: 500 var(--ewo-text-sm, 13px) / 1.3 var(--ewo-connection-font, var(--ewo-sans));
    white-space: nowrap;
    box-shadow: 0 10px 28px -12px rgb(0 0 0 / 0.45);
  }
  .text { overflow: hidden; text-overflow: ellipsis; }
  .mark { display: inline-flex; align-items: center; gap: 3px; height: 1em; }
  .mark i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: dot 900ms ease-in-out infinite; }
  .mark i:nth-child(2) { animation-delay: 150ms; }
  .mark i:nth-child(3) { animation-delay: 300ms; }
  :host([data-show='back']) .mark { display: none; }
  :host([data-show='back']) .ok { display: inline-block; }
  .ok { display: none; width: 8px; height: 8px; border-radius: 50%; background: var(--ewo-ok, #3c9a5f); }
  @keyframes dot { 0%, 80%, 100% { opacity: 0.3; scale: 0.75; } 40% { opacity: 1; scale: 1; } }
  @media (prefers-reduced-motion: reduce) {
    :host { transition: none; }
    .mark i { animation: none; opacity: 0.75; }
  }
`, l = class extends e {
	static styles = [c];
	static observedAttributes = [
		"state",
		"connecting-label",
		"reconnecting-label",
		"back-label"
	];
	#e = 0;
	#t;
	#n;
	constructor() {
		super(), this.root.innerHTML = "<span class=\"pill\" part=\"pill\" role=\"status\" aria-live=\"polite\"><span class=\"mark\" aria-hidden=\"true\"><slot name=\"mark\"><i></i><i></i><i></i></slot></span><span class=\"ok\" aria-hidden=\"true\"></span><span class=\"text\"></span></span>", this.#t = this.root.querySelector(".text");
	}
	get state() {
		let e = this.getAttribute("state");
		return e === "connecting" || e === "reconnecting" ? e : "online";
	}
	set state(e) {
		this.setAttribute("state", e);
	}
	connectedCallback() {
		this.#n = r(() => this.#o()), this.#r();
	}
	disconnectedCallback() {
		this.#n?.(), clearTimeout(this.#e);
	}
	attributeChangedCallback(e) {
		this.isConnected && (e === "state" ? this.#r() : this.#o());
	}
	#r() {
		clearTimeout(this.#e);
		let e = this.state;
		if (e === "online") {
			let e = this.getAttribute("data-show");
			if (!e || e === "back") return;
			this.#i("back"), this.#e = window.setTimeout(() => this.#a(), s);
			return;
		}
		this.getAttribute("data-show") !== e && (this.#e = window.setTimeout(() => this.#i(e), o[e]));
	}
	#i(e) {
		this.setAttribute("data-show", e), this.#o();
	}
	#a() {
		this.removeAttribute("data-show");
	}
	#o() {
		let e = this.getAttribute("data-show");
		e && (this.#t.textContent = this.getAttribute(`${e}-label`) ?? a[i()][e]);
	}
};
n("ewo-connection", l);
//#endregion
export { l as EwoConnection };
