import { EwoElement as e, css as t, define as n, onPageLanguage as r, pageLanguage as i, reducedMotion as a } from "./base.js";
import { lockScroll as o } from "./scroll-lock.js";
import { lastInputWasKey as s, letGo as c, openerNow as l, returnFocus as u, trackInput as d } from "./modal-focus.js";
//#region packages/elements/src/guide.ts
var f = {
	en: {
		next: "Next",
		back: "Back",
		done: "Done",
		skip: "Skip",
		pages: "Pages",
		page: (e, t) => `Page ${e} of ${t}`
	},
	de: {
		next: "Weiter",
		back: "Zurück",
		done: "Fertig",
		skip: "Überspringen",
		pages: "Seiten",
		page: (e, t) => `Seite ${e} von ${t}`
	}
}, p = t`
  :host { display: contents; }

  dialog {
    position: fixed;
    inset: 0;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    margin: 0;
    padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
    border: 0;
    background: var(--ewo-guide-bg, var(--ewo-bg-raised));
    color: var(--ewo-guide-fg, var(--ewo-fg));
    overflow: hidden;
  }
  dialog[open] { display: flex; flex-direction: column; animation: in 280ms var(--ewo-ease); }
  dialog:focus { outline: none; }
  dialog.closing { animation: out 220ms var(--ewo-ease-io) forwards; }
  dialog::backdrop {
    background: oklch(0.1 0.01 270 / 0.55);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    animation: fade 300ms var(--ewo-ease);
  }
  dialog.closing::backdrop { animation: fade 220ms var(--ewo-ease) reverse forwards; }
  @media (min-width: 720px) {
    dialog {
      width: min(560px, calc(100vw - 48px));
      height: min(780px, calc(100dvh - 48px));
      margin: auto;
      padding: 0;
      border-radius: var(--ewo-r-xl);
      box-shadow: var(--ewo-highlight), var(--ewo-shadow);
    }
  }
  @keyframes in { from { opacity: 0; scale: 0.98; } }
  @keyframes out { to { opacity: 0; scale: 0.98; } }
  @keyframes fade { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    dialog[open], dialog.closing { animation-name: fade; scale: none; }
    dialog.closing { animation-direction: reverse; }
  }

  .top { display: flex; justify-content: flex-end; flex: none; padding: var(--ewo-space-3) var(--ewo-space-4) 0; }
  .skip {
    min-height: 40px;
    padding: 0 var(--ewo-space-3);
    border-radius: 999px;
    color: var(--ewo-guide-fg-2, var(--ewo-fg-2));
    font-size: var(--ewo-text-sm);
    font-weight: 600;
  }
  .skip:hover { color: var(--ewo-guide-fg, var(--ewo-fg)); }

  /* The pages side by side; the browser's own scroll snapping turns them under a finger. */
  .track {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .track::-webkit-scrollbar { display: none; }
  .track.fading { animation: fade 180ms ease-out; }
  ::slotted(*) {
    box-sizing: border-box;
    flex: 0 0 100%;
    min-width: 0;
    overflow-y: auto;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  /* The dots on a row of their own, Back and Next under them: nine dots and two buttons don't fit one
     row at 390 px. */
  footer {
    flex: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'dots dots' 'back next';
    align-items: center;
    row-gap: var(--ewo-space-2);
    column-gap: var(--ewo-space-3);
    padding: var(--ewo-space-2) var(--ewo-space-4) var(--ewo-space-4);
  }
  .dots { grid-area: dots; justify-self: center; flex-wrap: wrap; justify-content: center; }
  .back { grid-area: back; }
  .next { grid-area: next; }
  .back {
    justify-self: start;
    min-height: 44px;
    padding: 0 var(--ewo-space-3);
    border-radius: 999px;
    color: var(--ewo-guide-fg-2, var(--ewo-fg-2));
    font-weight: 600;
  }
  .back[hidden] { display: block !important; visibility: hidden; }
  .next {
    justify-self: end;
    min-height: 44px;
    padding: 0 var(--ewo-space-5);
    border-radius: 999px;
    background: var(--ewo-guide-accent, var(--ewo-accent));
    color: var(--ewo-guide-accent-ink, var(--ewo-accent-ink));
    font-weight: 650;
  }
  /* The dots: all one size, the current one in the "on" colour (Stichle's user, 2026-10-13: a long
     pill for the current page wasn't wanted). Each a 22 px button around its mark. */
  .dots { display: flex; align-items: center; gap: 2px; }
  .dot { display: grid; place-items: center; width: 22px; height: 32px; }
  .dot span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    /* Colour alone tells the current page now: muted text and full text are 3:1 apart and 3:1 off
       the raised background, in light and dark (aria-current says it to a screen reader). */
    background: var(--ewo-guide-dot, var(--ewo-fg-3));
    transition: background var(--ewo-dur-2) var(--ewo-ease);
  }
  .dot[aria-current='step'] span { background: var(--ewo-guide-dot-on, var(--ewo-fg)); }
  @media (prefers-reduced-motion: reduce) { .dot span { transition: none; } }
  .live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
`, m = class extends e {
	static styles = [p];
	static observedAttributes = [
		"open",
		"label",
		"next-label",
		"back-label",
		"done-label",
		"skip-label"
	];
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	#c = 0;
	#l = 0;
	#u = null;
	#d = 0;
	#f = !1;
	#p;
	#m = null;
	#h;
	constructor() {
		super(), this.root.innerHTML = "\n      <dialog part=\"dialog\" tabindex=\"-1\" autofocus aria-roledescription=\"guide\">\n        <div class=\"top\"><button class=\"skip\" part=\"skip\" type=\"button\"></button></div>\n        <div class=\"track\" part=\"track\"><slot></slot></div>\n        <p class=\"live\" aria-live=\"polite\"></p>\n        <footer part=\"footer\">\n          <button class=\"back\" part=\"back\" type=\"button\"></button>\n          <div class=\"dots\" part=\"dots\" role=\"group\"></div>\n          <button class=\"next\" part=\"next\" type=\"button\"></button>\n        </footer>\n      </dialog>";
		let e = (e) => this.root.querySelector(e);
		this.#e = e("dialog"), this.#t = e(".track"), this.#n = e("slot"), this.#r = e(".dots"), this.#i = e(".back"), this.#a = e(".next"), this.#o = e(".skip"), this.#s = e(".live"), this.#e.addEventListener("cancel", (e) => {
			e.preventDefault(), this.#C();
		}), this.#e.addEventListener("click", (e) => {
			e.target === this.#e && this.#C();
		}), this.#e.addEventListener("animationend", (e) => {
			this.#f && e.target === this.#e && this.#T();
		}), this.#e.addEventListener("keydown", (e) => {
			if (!e.composedPath()[0].closest?.("input, textarea, select, [contenteditable]")) {
				if (e.key === "ArrowRight") this.goTo(this.#c + 1);
				else if (e.key === "ArrowLeft") this.goTo(this.#c - 1);
				else return;
				e.preventDefault();
			}
		}), this.#o.addEventListener("click", () => this.#C()), this.#i.addEventListener("click", () => this.goTo(this.#c - 1)), this.#a.addEventListener("click", () => {
			if (this.#c < this.#_().length - 1) return this.goTo(this.#c + 1);
			this.emit("done"), this.close();
		}), this.#r.addEventListener("click", (e) => {
			let t = e.target.closest(".dot");
			t && this.goTo(Number(t.dataset.i));
		}), this.#n.addEventListener("slotchange", () => this.#b()), this.#t.addEventListener("scroll", () => {
			cancelAnimationFrame(this.#l), this.#l = requestAnimationFrame(() => {
				let e = this.#t.clientWidth || 1, t = this.#t.scrollLeft / e;
				if (this.#u !== null) {
					if (Math.abs(t - this.#u) > .01) return;
					this.#g();
				}
				let n = Math.round(t);
				n !== this.#c && this.#x(n);
			});
		});
		for (let e of [
			"pointerdown",
			"touchstart",
			"wheel"
		]) this.#t.addEventListener(e, () => this.#g(), { passive: !0 });
	}
	connectedCallback() {
		d(), this.#h = r(() => this.#b()), this.#b(), this.#w();
	}
	disconnectedCallback() {
		this.#h?.(), this.#E();
	}
	attributeChangedCallback(e) {
		e === "label" ? this.#e.setAttribute("aria-label", this.getAttribute("label") ?? "") : e === "open" ? this.isConnected && this.#w() : this.#b();
	}
	get open() {
		return this.flag("open");
	}
	set open(e) {
		this.flag("open", e);
	}
	get page() {
		return this.#c;
	}
	show() {
		this.open = !0;
	}
	close() {
		this.open = !1;
	}
	goTo(e) {
		let t = this.#_().length;
		if (!t) return;
		let n = Math.max(0, Math.min(t - 1, e));
		if (n === this.#c && this.#t.scrollLeft === n * this.#t.clientWidth) return;
		let r = a();
		r && (this.#t.classList.remove("fading"), this.#t.offsetWidth, this.#t.classList.add("fading")), this.#u = n, clearTimeout(this.#d), this.#d = window.setTimeout(() => this.#g(), 1e3), this.#t.scrollTo({
			left: n * this.#t.clientWidth,
			behavior: r ? "instant" : "smooth"
		}), r && this.#g(), this.#x(n);
	}
	#g() {
		this.#u = null, clearTimeout(this.#d);
	}
	#_() {
		return this.#n.assignedElements();
	}
	#v() {
		return f[i()];
	}
	#y(e) {
		return e?.getAttribute("aria-label") ?? e?.querySelector("h1, h2, h3")?.textContent?.trim() ?? "";
	}
	#b() {
		let e = this.#v(), t = this.#_(), n = t.length;
		this.#o.textContent = this.getAttribute("skip-label") ?? e.skip, this.#i.textContent = this.getAttribute("back-label") ?? e.back, this.#r.setAttribute("aria-label", e.pages), this.#r.replaceChildren(...t.map((t, r) => {
			let i = document.createElement("button");
			return i.type = "button", i.className = "dot", i.dataset.i = String(r), i.setAttribute("aria-label", `${e.page(r + 1, n)}${this.#y(t) ? `: ${this.#y(t)}` : ""}`), i.append(document.createElement("span")), i;
		})), t.forEach((t, r) => {
			t.setAttribute("role", "group"), t.setAttribute("aria-roledescription", i() === "de" ? "Seite" : "page"), !t.hasAttribute("aria-label") && !t.hasAttribute("aria-labelledby") && t.setAttribute("aria-label", this.#y(t) || e.page(r + 1, n));
		}), this.#c = Math.min(this.#c, Math.max(0, n - 1)), this.#S(!1);
	}
	#x(e) {
		this.#c = e, this.#S(!0), this.emit("page", { index: e });
	}
	#S(e) {
		let t = this.#v(), n = this.#_(), r = n.length, i = this.#c >= r - 1;
		this.#i.hidden = this.#c === 0, this.#a.textContent = i ? this.getAttribute("done-label") ?? t.done : this.getAttribute("next-label") ?? t.next, this.#r.querySelectorAll(".dot").forEach((e, t) => {
			t === this.#c ? e.setAttribute("aria-current", "step") : e.removeAttribute("aria-current");
		}), n.forEach((e, t) => e.toggleAttribute("inert", t !== this.#c)), e && r && (this.#s.textContent = `${t.page(this.#c + 1, r)}: ${this.#y(n[this.#c])}`);
	}
	#C() {
		this.emit("cancel", void 0, !0) && this.close();
	}
	#w() {
		let e = this.#e;
		this.open && !e.open ? (this.#f = !1, e.classList.remove("closing"), d(), this.#m = l(), e.showModal(), this.#p ??= o(), this.#g(), this.#t.scrollLeft = 0, this.#c = 0, this.#S(!0)) : !this.open && e.open && !this.#f && (this.#f = !0, e.classList.add("closing"), setTimeout(() => this.#f && this.#T(), 400));
	}
	#T() {
		this.#f = !1, this.#e.classList.remove("closing");
		let e = !s();
		e && c(this, this.root, this.#e), this.#e.open && this.#e.close();
		let t = this.#m;
		this.#m = null, u(t, this.#e, e), this.#E(), this.emit("close");
	}
	#E() {
		this.#p?.(), this.#p = void 0;
	}
};
n("ewo-guide", m);
function h(e) {
	try {
		return !localStorage.getItem(e) && (localStorage.setItem(e, String(Date.now())), !0);
	} catch {
		return !1;
	}
}
//#endregion
export { m as EwoGuide, h as firstVisit };
