import { EwoElement as e, css as t, define as n, reducedMotion as r } from "./base.js";
import { lockScroll as i } from "./scroll-lock.js";
import { lastInputWasKey as a, letGo as o, openerNow as s, returnFocus as c, trackInput as l } from "./modal-focus.js";
//#region packages/elements/src/sheet.ts
var u = t`
  :host { display: contents; }

  dialog {
    position: fixed;
    inset: auto 0 0 0;
    width: 100%;
    max-width: 100%;
    max-height: min(92dvh, 900px);
    margin: 0;
    padding: 0;
    border: 1px solid var(--ewo-line);
    border-bottom: 0;
    border-radius: var(--ewo-r-xl) var(--ewo-r-xl) 0 0;
    background: var(--ewo-bg-raised);
    color: var(--ewo-fg);
    box-shadow: var(--ewo-highlight), 0 -30px 80px -20px rgb(0 0 0 / 0.5);
    overflow: hidden;
    translate: 0 var(--drag, 0px);
  }
  dialog[open] {
    display: flex;
    flex-direction: column;
    animation: up var(--ewo-dur-3) var(--ewo-ease);
  }
  /* The dialog takes focus itself on open (autofocus), so no control lights up. */
  dialog:focus { outline: none; }
  dialog.dragging { transition: none; }
  dialog:not(.dragging) { transition: translate var(--ewo-dur-2) var(--ewo-ease); }
  dialog.closing { animation: down 260ms var(--ewo-ease-io) forwards; }
  /* Cantina's backdrop, every app's since 2026-10-07 (plans/settings-alignment.md): darkened, with a
     slight blur, fading in over 300 ms and out over 260 ms. */
  dialog::backdrop {
    background: oklch(0.1 0.01 270 / 0.5);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    animation: fade 300ms var(--ewo-ease);
  }
  dialog.closing::backdrop { animation: fade 260ms var(--ewo-ease) reverse forwards; }

  @media (min-width: 720px) {
    dialog {
      inset: 0;
      width: min(480px, calc(100vw - 48px));
      max-height: min(80dvh, 760px);
      margin: auto;
      border-bottom: 1px solid var(--ewo-line);
      border-radius: var(--ewo-r-xl);
      box-shadow: var(--ewo-highlight), var(--ewo-shadow);
      translate: none;
    }
    :host([wide]) dialog { width: min(720px, calc(100vw - 48px)); }
    :host([placement='top']) dialog { margin-top: 12dvh; }
    dialog[open] { animation-name: pop; }
    dialog.closing { animation-name: unpop; }
  }

  @keyframes up { from { translate: 0 100%; } }
  @keyframes down { to { translate: 0 100%; } }
  /* A rise, not a grow (2026-10-15): after a scale-in, Chrome kept the paint it made while scaling
     whenever the centred dialog sat on a half pixel, and drew segmented tracks 1 px off their pills
     until something repainted them (Stichle's settings, a DPR-1 screen). */
  @keyframes pop { from { opacity: 0; translate: 0 10px; } }
  @keyframes unpop { to { opacity: 0; scale: 0.97; } }
  @keyframes fade { from { opacity: 0; } }

  /* The sheet is dragged down by the grip or the header (2026-10-07: the 22 px grip alone was hard
     to hit). The grip is 6 px taller and overlaps the header by as much, so nothing below it moves. */
  .grip { display: grid; place-items: center; height: 28px; margin-bottom: -6px; flex: none; touch-action: none; cursor: grab; }
  /* Light mode's grip is as strong as iOS's own grabber (its tertiary label, about 30%): at the 10%
     of --ewo-fill-3 it all but vanished on a white sheet, and on Clinch's pale team colours
     (2026-10-19). Dark mode keeps the fill, as the token, so it stays exactly what it was. */
  .grip span { width: 44px; height: 5px; border-radius: 3px; background: light-dark(rgb(19 19 21 / 0.3), var(--ewo-fill-3)); }
  /* A card from 720px drags nowhere, so no grip. After the rule above: placed with the other 720px
     rules it lost to it, and every desktop sheet showed a grip that did nothing (until 2026-10-07). */
  @media (min-width: 720px) { .grip { display: none; } }

  header {
    display: flex;
    align-items: center;
    gap: var(--ewo-space-3);
    padding: var(--ewo-space-3) var(--ewo-space-5) var(--ewo-space-2);
  }
  @media (max-width: 719px) { header { touch-action: none; } }
  @media (min-width: 720px) { header { padding-top: var(--ewo-space-5); } }
  .heading { flex: 1; min-width: 0; font-size: var(--ewo-text-lg); font-weight: 600; }
  .close {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--ewo-fg-2);
    background: var(--ewo-fill-2);
  }
  .close:hover { color: var(--ewo-fg); background: var(--ewo-fill-3); }
  .close svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
  /* \`auto\`, not \`flex: 1\`: the dialog has a max-height but no height, and Safari resolves a 0%
     basis against that literally, so the sheet opened as a sliver at the bottom (Cantina, then
     Pinout's settings, learnings/ios-and-webkit.md). Sized by its content, then shrunk to fit and
     scrolled, it works the same everywhere. */
  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: var(--ewo-space-2) var(--ewo-space-5) calc(var(--ewo-space-5) + env(safe-area-inset-bottom));
  }
  footer { padding: var(--ewo-space-3) var(--ewo-space-5) max(var(--ewo-space-5), env(safe-area-inset-bottom)); border-top: 1px solid var(--ewo-line-2); }
  footer:not(.has) { display: none; }
  /* In a phone's browser (not an installed app), Safari's floating toolbar covers the bottom of
     the sheet; leave room to scroll the last rows (or the footer) above it. */
  @media (display-mode: browser) and (max-width: 719px) {
    dialog:not(.with-footer) .body { padding-bottom: calc(env(safe-area-inset-bottom) + 76px); }
    footer { padding-bottom: calc(env(safe-area-inset-bottom) + 76px); }
  }
`, d = class extends e {
	static styles = [u];
	static observedAttributes = ["open", "label"];
	#e;
	#t = !1;
	#n;
	#r = 0;
	#i = 0;
	#a = null;
	constructor() {
		super(), this.root.innerHTML = "\n      <dialog part=\"dialog\" tabindex=\"-1\" autofocus>\n        <div class=\"grip\" part=\"grip\" aria-hidden=\"true\"><span></span></div>\n        <header part=\"header\">\n          <div class=\"heading\"><slot name=\"heading\"></slot></div>\n          <button class=\"close\" part=\"close\" type=\"button\" aria-label=\"Close\">\n            <svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M4 4l8 8M12 4l-8 8\"/></svg>\n          </button>\n        </header>\n        <div class=\"body\" part=\"body\"><slot></slot></div>\n        <footer part=\"footer\"><slot name=\"footer\"></slot></footer>\n      </dialog>";
		let e = this.#e = this.root.querySelector("dialog");
		e.addEventListener("cancel", (e) => {
			e.preventDefault(), this.#o();
		}), e.addEventListener("click", (t) => {
			t.target === e && this.#o();
		}), e.addEventListener("animationend", (t) => {
			this.#t && t.target === e && this.#c();
		}), this.root.querySelector(".close").addEventListener("click", () => this.#o());
		let t = this.root.querySelector("footer"), n = t.querySelector("slot");
		n.addEventListener("slotchange", () => {
			let r = n.assignedElements().length > 0;
			t.classList.toggle("has", r), e.classList.toggle("with-footer", r);
		});
		let r = matchMedia("(max-width: 719px)");
		for (let t of this.root.querySelectorAll(".grip, header")) {
			t.addEventListener("pointerdown", (n) => {
				n.pointerType !== "mouse" && r.matches && (n.composedPath()[0].closest?.("button, a, input, select, textarea, label, [contenteditable]") || (this.#r = n.clientY, e.classList.add("dragging"), t.setPointerCapture(n.pointerId)));
			}), t.addEventListener("pointermove", (t) => {
				e.classList.contains("dragging") && (this.#i = Math.max(0, t.clientY - this.#r), e.style.setProperty("--drag", `${this.#i}px`));
			});
			let n = () => {
				e.classList.contains("dragging") && (e.classList.remove("dragging"), this.#i > 90 ? this.#o() : e.style.setProperty("--drag", "0px"), this.#i = 0);
			};
			t.addEventListener("pointerup", n), t.addEventListener("pointercancel", n);
		}
	}
	connectedCallback() {
		l(), this.#s();
	}
	disconnectedCallback() {
		this.#d();
	}
	attributeChangedCallback(e) {
		e === "label" ? this.#e.setAttribute("aria-label", this.getAttribute("label") ?? "") : this.isConnected && this.#s();
	}
	get open() {
		return this.flag("open");
	}
	set open(e) {
		this.flag("open", e);
	}
	show() {
		this.open = !0;
	}
	close() {
		this.open = !1;
	}
	#o() {
		this.emit("cancel", void 0, !0) && this.close();
	}
	#s() {
		let e = this.#e;
		if (this.open && !e.open) this.#t = !1, e.classList.remove("closing"), e.style.setProperty("--drag", "0px"), l(), this.#a = s(), e.showModal(), this.#n ??= i();
		else if (!this.open && e.open && !this.#t) {
			if (r()) return this.#c();
			this.#t = !0, e.classList.add("closing"), setTimeout(() => this.#t && this.#c(), 450);
		}
	}
	#c() {
		this.#t = !1, this.#e.classList.remove("closing");
		let e = !a();
		e && this.#l(), this.#e.open && this.#e.close(), this.#u(e), this.#d(), this.emit("close");
	}
	#l() {
		o(this, this.root, this.#e);
	}
	#u(e) {
		let t = this.#a;
		this.#a = null, c(t, this.#e, e);
	}
	#d() {
		this.#n?.(), this.#n = void 0;
	}
};
n("ewo-sheet", d);
//#endregion
export { d as EwoSheet };
