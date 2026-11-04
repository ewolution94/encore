import { EwoElement as e, css as t, define as n, onPageLanguage as r, pageLanguage as i } from "./base.js";
import "./button.js";
import { dragRange as a, dropIndex as o, moveItem as s, shiftOf as c } from "./reorder-math.js";
//#region packages/elements/src/reorder.ts
var l = t`
  :host { display: block; min-width: 0; }
  .list { position: relative; display: grid; }
  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: var(--ewo-reorder-pad, 6px 12px 6px 6px);
    border-top: 1px solid var(--ewo-line);
    background: var(--ewo-reorder-bg, transparent);
  }
  .row:first-child { border-top-color: transparent; }
  .row.shift { transition: translate var(--ewo-dur-2) var(--ewo-ease); }
  .row.lift {
    z-index: 2;
    border-top-color: transparent;
    border-radius: var(--ewo-r-xs);
    background: var(--ewo-bg-raised);
    box-shadow: 0 10px 28px -12px var(--ewo-shadow-color), 0 0 0 1px var(--ewo-line-strong);
  }
  slot { display: block; flex: 1; min-width: 0; }
  .list.dragging slot::slotted(*) { user-select: none; -webkit-user-select: none; }

  .grip {
    flex: none;
    display: grid;
    place-items: center;
    width: 28px;
    height: 32px;
    border-radius: var(--ewo-r-xs);
    color: var(--ewo-fg-3);
    cursor: grab;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .grip svg { display: block; }
  .row.lift .grip { cursor: grabbing; color: var(--ewo-fg); }
  @media (hover: hover) and (pointer: fine) {
    .grip:hover { color: var(--ewo-fg); background: var(--ewo-fill-2); }
  }
  .arrows { flex: none; display: flex; gap: 4px; }
  :host(:not([arrows])) .arrows { display: none; }
  :host([disabled]) .grip, :host([disabled]) .arrows { display: none; }
  .live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
`, u = "<svg viewBox=\"0 0 10 16\" width=\"10\" height=\"16\" aria-hidden=\"true\" fill=\"currentColor\"><circle cx=\"2.5\" cy=\"3\" r=\"1.4\"/><circle cx=\"7.5\" cy=\"3\" r=\"1.4\"/><circle cx=\"2.5\" cy=\"8\" r=\"1.4\"/><circle cx=\"7.5\" cy=\"8\" r=\"1.4\"/><circle cx=\"2.5\" cy=\"13\" r=\"1.4\"/><circle cx=\"7.5\" cy=\"13\" r=\"1.4\"/></svg>", d = "<svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M4 10l4-4 4 4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", f = "<svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"M4 6l4 4 4-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", p = {
	en: {
		move: (e) => `Move ${e}`,
		up: (e) => `Move ${e} up`,
		down: (e) => `Move ${e} down`,
		help: "Drag, or use the arrow keys.",
		at: (e, t, n) => `${e}, ${t} of ${n}`
	},
	de: {
		move: (e) => `${e} verschieben`,
		up: (e) => `${e} nach oben`,
		down: (e) => `${e} nach unten`,
		help: "Ziehen oder mit den Pfeiltasten verschieben.",
		at: (e, t, n) => `${e}, Platz ${t} von ${n}`
	}
}, m = 48, h = 14;
function g(e) {
	for (let t = e; t; t = t.parentElement ?? (t.getRootNode().host || null)) {
		if (t === e) continue;
		let n = getComputedStyle(t).overflowY;
		if (/auto|scroll|overlay/.test(n) && t.scrollHeight > t.clientHeight) return t;
	}
	return document.scrollingElement ?? document.documentElement;
}
var _ = class extends e {
	static styles = [l];
	static observedAttributes = ["label", "disabled"];
	#e;
	#t;
	#n = /* @__PURE__ */ new Map();
	#r = [];
	#i = null;
	#a = null;
	#o = new MutationObserver(() => this.#f());
	#s = null;
	#c = 0;
	constructor() {
		super({
			mode: "open",
			slotAssignment: "manual"
		}), this.root.innerHTML = "<div class=\"list\" part=\"list\" role=\"list\"></div><div class=\"live\" role=\"status\" aria-live=\"polite\"></div><span id=\"help\" hidden></span>", this.#e = this.root.querySelector(".list"), this.#t = this.root.querySelector(".live");
	}
	connectedCallback() {
		this.#o.observe(this, {
			childList: !0,
			subtree: !0,
			characterData: !0,
			attributes: !0,
			attributeFilter: ["data-key", "data-label"]
		}), this.#s = r(() => this.#m()), this.#f();
	}
	disconnectedCallback() {
		this.#o.disconnect(), this.#s?.(), this.#b(!1);
	}
	attributeChangedCallback() {
		this.#m();
	}
	get disabled() {
		return this.flag("disabled");
	}
	set disabled(e) {
		this.flag("disabled", e);
	}
	get arrows() {
		return this.flag("arrows");
	}
	set arrows(e) {
		this.flag("arrows", e);
	}
	get order() {
		return this.#l().map((e, t) => this.#u(e, t));
	}
	#l() {
		return Array.from(this.children).filter((e) => e instanceof HTMLElement);
	}
	#u(e, t) {
		return e.dataset.key ?? String(t);
	}
	#d(e) {
		let t = e.dataset.label;
		if (t) return t;
		let n = [], r = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
		for (; r.nextNode();) n.push(r.currentNode.textContent ?? "");
		return n.join(" ").replace(/\s+/g, " ").trim().slice(0, 60);
	}
	#f() {
		let e = this.#l();
		if (this.#i) {
			if (e.length === this.#r.length && e.every((t) => this.#n.get(t) === this.#r[e.indexOf(t)])) {
				this.#m();
				return;
			}
			this.#b(!1);
		}
		let t = new Set(e);
		for (let [e, n] of this.#n) t.has(e) || (n.el.remove(), this.#n.delete(e));
		this.#r = e.map((e) => this.#n.get(e) ?? this.#p(e));
		let n = this.root.activeElement, r = this.#r.every((e, t) => this.#e.children[t] === e.el) && this.#e.children.length === this.#r.length;
		r || this.#e.append(...this.#r.map((e) => e.el)), this.#r.forEach((t, n) => t.slot.assign(e[n])), this.#m();
		let i = this.#a;
		if (this.#a = null, i) {
			let t = e.findIndex((e, t) => this.#u(e, t) === i.key), n = this.#r[t];
			n && (i.part === "up" && t === 0 ? n.down : i.part === "down" && t === e.length - 1 ? n.up : n[i.part]).focus();
		} else n instanceof HTMLElement && !r && this.root.contains(n) && n.focus();
	}
	#p(e) {
		let t = document.createElement("div");
		t.className = "row", t.part.add("row"), t.setAttribute("role", "listitem"), t.innerHTML = `<button type="button" class="grip" part="grip" aria-describedby="help">${u}</button><slot></slot><span class="arrows"><ewo-button icon size="sm" variant="quiet" data-dir="-1">${d}</ewo-button><ewo-button icon size="sm" variant="quiet" data-dir="1">${f}</ewo-button></span>`;
		let n = {
			el: t,
			slot: t.querySelector("slot"),
			grip: t.querySelector(".grip"),
			up: t.querySelector("[data-dir=\"-1\"]"),
			down: t.querySelector("[data-dir=\"1\"]")
		};
		this.#n.set(e, n), n.grip.addEventListener("pointerdown", (e) => this.#_(e, n)), n.grip.addEventListener("keydown", (e) => {
			let t = this.#r.indexOf(n), r = this.#r.length - 1, i = e.key === "ArrowUp" ? t - 1 : e.key === "ArrowDown" ? t + 1 : e.key === "Home" ? 0 : e.key === "End" ? r : null;
			i !== null && (e.preventDefault(), this.#h(t, Math.max(0, Math.min(r, i)), "grip"));
		});
		for (let e of [n.up, n.down]) e.addEventListener("click", () => {
			let t = this.#r.indexOf(n), r = Number(e.dataset.dir);
			this.#h(t, t + r, r < 0 ? "up" : "down");
		});
		return n;
	}
	#m() {
		let e = p[i()], t = this.getAttribute("label");
		t ? this.#e.setAttribute("aria-label", t) : this.#e.removeAttribute("aria-label"), this.root.getElementById("help").textContent = e.help;
		let n = this.#l();
		this.#r.forEach((t, r) => {
			let i = this.#d(n[r] ?? t.el);
			t.grip.setAttribute("aria-label", e.move(i)), t.up.setAttribute("label", e.up(i)), t.down.setAttribute("label", e.down(i)), t.up.toggleAttribute("disabled", r === 0), t.down.toggleAttribute("disabled", r === this.#r.length - 1), t.grip.disabled = this.disabled;
		});
	}
	#h(e, t, n) {
		if (this.disabled || e === t || t < 0 || t >= this.#r.length) return;
		let r = this.#l(), a = r.map((e, t) => this.#u(e, t)), o = a[e], c = this.#g();
		this.#a = {
			key: o,
			part: n
		}, this.emit("change", {
			order: s(a, e, t),
			key: o,
			from: e,
			to: t
		}), this.#t.textContent = p[i()].at(this.#d(r[e]), t + 1, r.length), this.#x(c);
	}
	#g() {
		return new Map(this.#r.map((e) => [e, e.el.getBoundingClientRect().top]));
	}
	#_(e, t) {
		if (this.disabled || this.#i || e.pointerType === "mouse" && e.button !== 0) return;
		e.preventDefault(), t.grip.focus({ preventScroll: !0 });
		let n = this.#r.indexOf(t), r = this.#e.getBoundingClientRect().top, i = this.#r.map((e) => ({
			top: e.el.offsetTop,
			height: e.el.offsetHeight
		}));
		this.#i = {
			from: n,
			to: n,
			slots: i,
			range: a(i, n),
			start: e.clientY - r,
			y: e.clientY,
			id: e.pointerId,
			frame: 0,
			scroller: g(this)
		};
		try {
			t.grip.setPointerCapture(e.pointerId);
		} catch {}
		t.el.classList.add("lift"), this.#e.classList.add("dragging");
		for (let e of this.#r) e !== t && e.el.classList.add("shift");
		let o = (e) => {
			e.pointerId === this.#i?.id && (this.#i.y = e.clientY, this.#v());
		}, s = (e) => {
			e.pointerId === this.#i?.id && (t.grip.removeEventListener("pointermove", o), t.grip.removeEventListener("pointerup", s), t.grip.removeEventListener("pointercancel", s), this.#b(e.type === "pointerup"));
		};
		t.grip.addEventListener("pointermove", o), t.grip.addEventListener("pointerup", s), t.grip.addEventListener("pointercancel", s), this.#i.frame = requestAnimationFrame(() => this.#y());
	}
	#v() {
		let e = this.#i;
		if (!e) return;
		let t = Math.max(e.range[0], Math.min(e.range[1], e.y - this.#e.getBoundingClientRect().top - e.start));
		e.to = o(e.slots, e.from, t), this.#r.forEach((n, r) => {
			n.el.style.translate = r === e.from ? `0 ${t}px` : `0 ${c(e.slots, e.from, e.to, r)}px`;
		});
	}
	#y() {
		let e = this.#i;
		if (!e) return;
		let t = e.scroller === document.scrollingElement || e.scroller === document.documentElement ? {
			top: 0,
			bottom: innerHeight
		} : e.scroller.getBoundingClientRect(), n = e.y < t.top + m ? -14 * (1 - Math.max(0, e.y - t.top) / m) : e.y > t.bottom - m ? h * (1 - Math.max(0, t.bottom - e.y) / m) : 0;
		n && (e.scroller.scrollTop += n, this.#v()), e.frame = requestAnimationFrame(() => this.#y());
	}
	#b(e) {
		let t = this.#i;
		if (!t) return;
		this.#i = null, cancelAnimationFrame(t.frame);
		let n = this.#g();
		if (e && t.to !== t.from) {
			let e = this.#l(), n = e.map((e, t) => this.#u(e, t));
			this.#a = {
				key: n[t.from],
				part: "grip"
			}, this.emit("change", {
				order: s(n, t.from, t.to),
				key: n[t.from],
				from: t.from,
				to: t.to
			}), this.#t.textContent = p[i()].at(this.#d(e[t.from]), t.to + 1, e.length);
		}
		this.#x(n);
	}
	#x(e) {
		requestAnimationFrame(() => {
			this.#a = null, this.#e.classList.remove("dragging"), clearTimeout(this.#c);
			let t = [...e.keys()].filter((e) => e.el.isConnected);
			for (let e of t) e.el.classList.remove("shift"), e.el.style.translate = "";
			let n = t.map((e) => e.el.getBoundingClientRect().top);
			t.forEach((t, r) => t.el.style.translate = `0 ${e.get(t) - n[r]}px`), this.#e.offsetHeight;
			for (let e of t) e.el.classList.add("shift"), e.el.style.translate = "";
			let r = t.length && parseFloat(getComputedStyle(t[0].el).transitionDuration) * 1e3 || 0;
			this.#c = window.setTimeout(() => {
				for (let e of t) e.el.classList.remove("shift");
				if (!this.#i) for (let e of this.#r) e.el.classList.remove("lift");
			}, r + 30);
		});
	}
};
n("ewo-reorder", _);
//#endregion
export { _ as EwoReorder };
