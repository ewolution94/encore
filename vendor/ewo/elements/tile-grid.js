import { EwoElement as e, css as t, define as n, onPageLanguage as r, pageLanguage as i } from "./base.js";
import { arrange as a, resize as o, rowsOf as s, snapMove as c, snapSize as l, step as u } from "./tile-grid-math.js";
//#region packages/elements/src/tile-grid.ts
var d = t`
  :host { display: block; min-width: 0; }
  .grid {
    --cols: 12;
    --rows: 1;
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    grid-template-rows: repeat(var(--rows), var(--ewo-tile-grid-row, 40px));
    gap: var(--ewo-tile-grid-gap, 4px);
  }
  .cell {
    pointer-events: none;
    border: 1px dashed var(--ewo-line-strong);
    border-radius: 5px;
    opacity: 0.6;
  }
  .tile {
    position: relative;
    z-index: 1;
    display: flex;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    padding: var(--ewo-tile-grid-pad, 6px);
    background: var(--ewo-tile-grid-bg, var(--ewo-bg-raised));
    border: 1px solid var(--ewo-line-strong);
    border-radius: var(--ewo-r-xs);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
    cursor: grab;
    touch-action: pan-x pan-y;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
  .tile:focus { outline: none; border-color: var(--ewo-fg); box-shadow: 0 0 0 1px var(--ewo-fg); }
  .tile:focus-visible { outline: var(--ewo-focus); outline-offset: 2px; }
  .tile.shift { transition: translate var(--ewo-dur-2) var(--ewo-ease); }
  .tile.snap { transition: none; }
  .tile.lift {
    z-index: 3;
    cursor: grabbing;
    scale: 1.02;
    border-color: var(--ewo-fg);
    box-shadow: 0 16px 36px -14px var(--ewo-shadow-color), 0 0 0 1px var(--ewo-fg);
  }
  .tile.lift.sizing { scale: none; }
  @media (hover: hover) and (pointer: fine) {
    .tile:not(.lift):not(:focus):hover { border-color: var(--ewo-fg-3); }
  }
  slot { display: block; flex: 1; min-width: 0; min-height: 0; }
  .grid.dragging { cursor: grabbing; }
  .grid.dragging slot::slotted(*) { pointer-events: none; }

  .rz { position: absolute; z-index: 2; touch-action: none; }
  .rz[data-edge='e'] { top: 0; right: 0; bottom: 16px; width: 10px; cursor: ew-resize; }
  .rz[data-edge='s'] { left: 0; right: 16px; bottom: 0; height: 10px; cursor: ns-resize; }
  .rz[data-edge='se'] { right: 0; bottom: 0; width: 18px; height: 18px; cursor: nwse-resize; }
  .rz[data-edge='se']::after {
    content: '';
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 7px;
    height: 7px;
    border-right: 2px solid var(--ewo-fg-3);
    border-bottom: 2px solid var(--ewo-fg-3);
  }
  .tile:hover .rz[data-edge='se']::after, .tile.lift .rz[data-edge='se']::after { border-color: var(--ewo-fg); }

  .ghost {
    pointer-events: none;
    z-index: 4;
    display: grid;
    place-items: center;
    border: 2px dashed var(--ewo-fg);
    border-radius: var(--ewo-r-xs);
    background: color-mix(in oklab, var(--ewo-fg) 6%, transparent);
  }
  .ghost[hidden], .ghost span { display: none; }
  .ghost.sizing { background: none; }
  .ghost.sizing span {
    display: block;
    padding: 2px 7px;
    border-radius: 999px;
    background: var(--ewo-fg);
    color: var(--ewo-bg);
    font: 600 11px/1.4 var(--ewo-mono);
    white-space: nowrap;
  }

  :host([disabled]) .tile { cursor: default; touch-action: auto; }
  :host([disabled]) .rz { display: none; }
  .live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
`, f = {
	en: {
		tile: "tile",
		help: "Drag to move it, onto another tile to make room; drag its edge to resize it. Arrow keys move it, with Shift they resize it, Escape cancels a drag.",
		at: (e, t) => `${e}: column ${t[0]}, row ${t[1]}, ${t[2]} by ${t[3]}`,
		swapped: (e) => `Traded places with ${e}.`,
		made: (e) => `Made room: ${e}.`,
		edge: (e) => `${e} is at the edge.`,
		smallest: (e, t, n) => `${e} is at its smallest, ${t} by ${n}.`,
		back: "Put back."
	},
	de: {
		tile: "Kachel",
		help: "Ziehen zum Verschieben, auf eine andere Kachel, um Platz zu machen; am Rand ziehen für die Größe. Pfeiltasten verschieben, mit Umschalt ändern sie die Größe, Escape bricht ab.",
		at: (e, t) => `${e}: Spalte ${t[0]}, Zeile ${t[1]}, ${t[2]} × ${t[3]}`,
		swapped: (e) => `Getauscht mit ${e}.`,
		made: (e) => `Platz gemacht: ${e}.`,
		edge: (e) => `${e} ist am Rand.`,
		smallest: (e, t, n) => `${e} ist schon am kleinsten, ${t} × ${n}.`,
		back: "Zurückgelegt."
	}
}, p = 340, m = 6, h = 48, g = 14, _ = "a[href], button, input, select, textarea, label, summary, [contenteditable], [data-no-drag]", v = (e) => `${e[1]} / ${e[0]} / span ${e[3]} / span ${e[2]}`, y = (e, t) => e.every((e, n) => e === t[n]);
function b(e, t) {
	let n = (e ?? "").trim().split(/[\s,]+/).map(Number);
	return n.length === t && n.every((e) => Number.isInteger(e) && e >= 1) ? n : null;
}
function x(e) {
	for (let t = e; t; t = t.parentElement ?? (t.getRootNode().host || null)) {
		if (t === e) continue;
		let n = getComputedStyle(t).overflowY;
		if (/auto|scroll|overlay/.test(n) && t.scrollHeight > t.clientHeight) return t;
	}
	return document.scrollingElement ?? document.documentElement;
}
var S = class extends e {
	static styles = [d];
	static observedAttributes = [
		"label",
		"columns",
		"disabled",
		"compact"
	];
	#e;
	#t;
	#n;
	#r = /* @__PURE__ */ new Map();
	#i = 0;
	#a = null;
	#o = null;
	#s = null;
	#c = new MutationObserver(() => this.#v());
	#l = null;
	#u = 0;
	constructor() {
		super({
			mode: "open",
			slotAssignment: "manual"
		}), this.root.innerHTML = "<div class=\"grid\" part=\"grid\" role=\"group\"><div class=\"ghost\" part=\"ghost\" hidden><span></span></div></div><div class=\"live\" role=\"status\" aria-live=\"polite\"></div><span id=\"help\" hidden></span>", this.#e = this.root.querySelector(".grid"), this.#t = this.root.querySelector(".ghost"), this.#n = this.root.querySelector(".live"), this.#e.addEventListener("touchmove", (e) => this.#o && e.preventDefault(), { passive: !1 });
	}
	connectedCallback() {
		this.#c.observe(this, {
			childList: !0,
			subtree: !0,
			characterData: !0,
			attributes: !0,
			attributeFilter: [
				"data-key",
				"data-label",
				"data-rect",
				"data-min"
			]
		}), this.#l = r(() => this.#S()), addEventListener("keydown", this.#E, !0), this.#v();
	}
	disconnectedCallback() {
		this.#c.disconnect(), this.#l?.(), removeEventListener("keydown", this.#E, !0), this.#T(), this.#F(!1);
	}
	attributeChangedCallback(e) {
		e === "label" ? this.#S() : this.#v();
	}
	get columns() {
		let e = Number(this.getAttribute("columns"));
		return Number.isInteger(e) && e >= 1 ? e : 12;
	}
	set columns(e) {
		this.setAttribute("columns", String(e));
	}
	get compact() {
		return this.flag("compact");
	}
	set compact(e) {
		this.flag("compact", e);
	}
	get disabled() {
		return this.flag("disabled");
	}
	set disabled(e) {
		this.flag("disabled", e);
	}
	get layout() {
		let e = {};
		for (let t of this.#d()) {
			let n = this.#p(t);
			n && (e[this.#f(t)] = n);
		}
		return e;
	}
	#d() {
		return Array.from(this.children).filter((e) => e instanceof HTMLElement);
	}
	#f(e) {
		return e.dataset.key ?? String(this.#d().indexOf(e));
	}
	#p(e) {
		let t = b(e.dataset.rect, 4);
		return t && t[0] + t[2] - 1 <= this.columns ? t : null;
	}
	#m(e) {
		let t = b(e.dataset.min, 2);
		return t ? [t[0], t[1]] : [1, 1];
	}
	#h(e) {
		if (e.dataset.label) return e.dataset.label;
		let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
		for (; n.nextNode();) t.push(n.currentNode.textContent ?? "");
		return t.join(" ").replace(/\s+/g, " ").trim().slice(0, 60);
	}
	#g(e) {
		return this.#d().find((t) => this.#f(t) === e);
	}
	#_() {
		return {
			columns: this.columns,
			compact: this.compact
		};
	}
	#v() {
		let e = this.#d();
		if (this.#o) {
			if (this.#r.has(this.#o.tile.item) && e.includes(this.#o.tile.item)) return this.#S();
			this.#F(!1);
		}
		let t = new Set(e);
		for (let [e, n] of this.#r) t.has(e) || (n.el.remove(), this.#r.delete(e));
		for (let t of e) {
			let e = this.#p(t), n = this.#r.get(t);
			if (!e) {
				n?.el.remove(), this.#r.delete(t);
				continue;
			}
			n ||= this.#x(t), n.el.isConnected || this.#e.append(n.el), n.slot.assign(t), n.el.style.gridArea = v(e);
		}
		this.#b(s(this.layout)), this.#S();
		let n = this.#s;
		this.#s = null, n && this.#y(n)?.el.focus({ preventScroll: !0 });
	}
	#y(e) {
		let t = this.#g(e);
		return t ? this.#r.get(t) : void 0;
	}
	#b(e) {
		let t = Math.max(1, e + +!this.disabled), n = this.columns;
		this.#e.style.setProperty("--cols", String(n)), this.#e.style.setProperty("--rows", String(t));
		let r = t * n;
		if (r === this.#i && this.#e.dataset.columns === String(n)) return;
		this.#e.dataset.columns = String(n);
		for (let e of this.#e.querySelectorAll(".cell")) e.remove();
		let i = document.createDocumentFragment();
		for (let e = 0; e < r; e++) {
			let t = document.createElement("i");
			t.className = "cell", t.part.add("cell"), t.style.gridArea = `${Math.floor(e / n) + 1} / ${e % n + 1}`, i.append(t);
		}
		this.#e.prepend(i), this.#i = r;
	}
	#x(e) {
		let t = document.createElement("div");
		t.className = "tile", t.part.add("tile"), t.setAttribute("role", "group"), t.setAttribute("aria-describedby", "help"), t.innerHTML = "<slot></slot><i class=\"rz\" data-edge=\"e\"></i><i class=\"rz\" data-edge=\"s\"></i><i class=\"rz\" data-edge=\"se\"></i>";
		let n = {
			el: t,
			slot: t.querySelector("slot"),
			item: e
		};
		return this.#r.set(e, n), t.addEventListener("pointerdown", (e) => this.#w(e, n)), t.addEventListener("keydown", (e) => this.#C(e, n)), t.addEventListener("focus", () => this.emit("tile-focus", { key: this.#f(n.item) })), t.addEventListener("contextmenu", (e) => {
			(this.#a?.tile === n || this.#o?.tile === n) && e.preventDefault();
		}), t.addEventListener("dragstart", (e) => e.preventDefault()), n;
	}
	#S() {
		let e = f[i()], t = this.getAttribute("label");
		t ? this.#e.setAttribute("aria-label", t) : this.#e.removeAttribute("aria-label"), this.root.getElementById("help").textContent = e.help;
		for (let t of this.#r.values()) {
			let n = this.#p(t.item);
			n && t.el.setAttribute("aria-label", e.at(this.#h(t.item), n)), t.el.setAttribute("aria-roledescription", e.tile), t.el.tabIndex = this.disabled ? -1 : 0;
		}
	}
	#C(e, t) {
		let n = {
			ArrowLeft: [-1, 0],
			ArrowRight: [1, 0],
			ArrowUp: [0, -1],
			ArrowDown: [0, 1]
		}[e.key];
		if (!n || this.disabled || this.#o || e.target !== t.el || e.altKey || e.metaKey || e.ctrlKey) return;
		e.preventDefault();
		let r = this.#f(t.item), a = this.layout, s = a[r], c = f[i()], l = this.#h(t.item), d;
		if (e.shiftKey) {
			let e = this.#m(t.item);
			if (d = o(a, r, s[2] + n[0], s[3] + n[1], e, this.#_()), y(d.tiles[r], s) && !d.moved.length) {
				let t = n[0] < 0 || n[1] < 0;
				this.#n.textContent = t ? c.smallest(l, e[0], e[1]) : c.edge(l);
				return;
			}
			this.#I(d, r, "resize");
		} else {
			if (d = u(a, r, n[0], n[1], this.#_()), !d) {
				this.#n.textContent = c.edge(l);
				return;
			}
			this.#I(d, r, "move");
		}
	}
	#w(e, t) {
		if (this.disabled || this.#o || this.#a || !e.isPrimary || e.pointerType === "mouse" && e.button !== 0) return;
		let n = e.composedPath(), r = n.find((e) => e instanceof Element && e.matches(_));
		if (r && t.item.contains(r)) return;
		let i = n.find((e) => e instanceof HTMLElement && e.classList.contains("rz"))?.dataset.edge ?? "move", a = e.pointerType === "touch";
		a || e.preventDefault(), t.el.focus({ preventScroll: !0 });
		try {
			t.el.setPointerCapture(e.pointerId);
		} catch {}
		let o = {
			tile: t,
			key: this.#f(t.item),
			mode: i,
			id: e.pointerId,
			x0: e.clientX,
			y0: e.clientY,
			touch: a,
			timer: 0
		};
		this.#a = o, a && i === "move" ? o.timer = window.setTimeout(() => this.#O(o, o.x0, o.y0), p) : i !== "move" && this.#O(o, e.clientX, e.clientY);
		let s = (e) => {
			if (e.pointerId === o.id) {
				if (this.#o) {
					this.#o.x = e.clientX, this.#o.y = e.clientY, this.#k();
					return;
				}
				this.#a === o && (Math.hypot(e.clientX - o.x0, e.clientY - o.y0) < m || (o.touch ? this.#T() : this.#O(o, e.clientX, e.clientY)));
			}
		}, c = (e) => {
			e.pointerId === o.id && (t.el.removeEventListener("pointermove", s), t.el.removeEventListener("pointerup", c), t.el.removeEventListener("pointercancel", c), this.#a === o && this.#T(), this.#o?.id === o.id && this.#F(e.type === "pointerup"));
		};
		t.el.addEventListener("pointermove", s), t.el.addEventListener("pointerup", c), t.el.addEventListener("pointercancel", c);
	}
	#T() {
		this.#a &&= (clearTimeout(this.#a.timer), null);
	}
	#E = (e) => {
		e.key === "Escape" && this.#o && (e.preventDefault(), e.stopPropagation(), this.#F(!1), this.#n.textContent = f[i()].back);
	};
	#D() {
		let e = getComputedStyle(this.#e), t = parseFloat(e.columnGap) || 0, n = parseFloat(e.gridTemplateRows.split(" ")[0]) || 40;
		return {
			x: (this.#e.clientWidth + t) / this.columns,
			y: n + parseFloat(e.rowGap || "0")
		};
	}
	#O(e, t, n) {
		clearTimeout(e.timer), this.#a = null;
		let r = this.layout, i = r[e.key];
		if (!i) return;
		let a = this.#e.getBoundingClientRect();
		this.#o = {
			tile: e.tile,
			key: e.key,
			mode: e.mode,
			id: e.id,
			start: r,
			from: i,
			min: this.#m(e.tile.item),
			pitch: this.#D(),
			gx: e.x0 - a.left,
			gy: e.y0 - a.top,
			x: t,
			y: n,
			target: v(i),
			next: null,
			rows: s(r),
			frame: 0,
			scroller: x(this)
		}, e.touch && navigator.vibrate?.(8), e.tile.el.classList.add("lift", "snap"), e.tile.el.classList.toggle("sizing", e.mode !== "move"), this.#e.classList.add("dragging");
		for (let t of this.#r.values()) t !== e.tile && t.el.classList.add("shift");
		this.#t.classList.toggle("sizing", e.mode !== "move"), this.#j(i), this.#k(), this.#o.frame = requestAnimationFrame(() => this.#P());
	}
	#k() {
		let e = this.#o;
		if (!e) return;
		let t = this.#e.getBoundingClientRect(), n = e.x - t.left - e.gx, r = e.y - t.top - e.gy, i = this.#_(), s;
		if (e.mode === "move") {
			e.tile.el.style.translate = `${n}px ${r}px`;
			let [t, a] = c(e.from, n, r, e.pitch, i.columns);
			s = [
				t,
				a,
				e.from[2],
				e.from[3]
			];
		} else {
			let [t, i] = l(e.from, e.mode === "s" ? 0 : n, e.mode === "e" ? 0 : r, e.pitch);
			s = [
				e.from[0],
				e.from[1],
				t,
				i
			];
		}
		let u = v(s);
		u === e.target && e.next || (e.target = u, e.next = e.mode === "move" ? a(e.start, e.key, s, i) : o(e.start, e.key, s[2], s[3], e.min, i), this.#A(e.next.tiles, e));
	}
	#A(e, t) {
		t.rows = Math.max(t.rows, s(e)), this.#b(t.rows);
		let n = [...this.#r.values()].filter((e) => e !== t.tile || t.mode !== "move");
		this.#M(n, (t) => e[this.#f(t.item)]), this.#j(e[t.key]);
	}
	#j(e) {
		this.#t.hidden = !e, e && (this.#t.style.gridArea = v(e), this.#t.firstElementChild.textContent = `${e[2]} × ${e[3]}`);
	}
	#M(e, t, n = this.#N(e)) {
		for (let n of e) {
			let e = t(n);
			e && (n.el.style.gridArea = v(e)), n.el.classList.add("snap"), n.el.style.translate = "";
		}
		for (let t of e) {
			let e = n.get(t);
			if (!e) continue;
			let r = t.el.getBoundingClientRect(), i = e.left - r.left, a = e.top - r.top;
			(Math.abs(i) > .5 || Math.abs(a) > .5) && (t.el.style.translate = `${i}px ${a}px`);
		}
		this.#e.offsetHeight;
		for (let t of e) t.el.classList.remove("snap"), t.el.classList.add("shift"), t.el.style.translate = "";
	}
	#N(e = [...this.#r.values()]) {
		return new Map(e.map((e) => [e, e.el.getBoundingClientRect()]));
	}
	#P() {
		let e = this.#o;
		if (!e) return;
		let t = e.scroller === document.scrollingElement || e.scroller === document.documentElement ? {
			top: 0,
			bottom: innerHeight
		} : e.scroller.getBoundingClientRect(), n = e.y < t.top + h ? -14 * (1 - Math.max(0, e.y - t.top) / h) : e.y > t.bottom - h ? g * (1 - Math.max(0, t.bottom - e.y) / h) : 0;
		n && (e.scroller.scrollTop += n, this.#k()), e.frame = requestAnimationFrame(() => this.#P());
	}
	#F(e) {
		let t = this.#o;
		if (!t) return;
		this.#o = null, cancelAnimationFrame(t.frame), this.#j(null), this.#e.classList.remove("dragging");
		let n = t.next, r = !!n && (!y(n.tiles[t.key], t.from) || n.moved.length > 0);
		e && n && r ? this.#I(n, t.key, t.mode === "move" ? "move" : "resize") : this.#L(this.#N());
	}
	#I(e, t, n) {
		let r = f[i()], a = this.#g(t), o = e.moved.map((e) => this.#g(e)).filter((e) => !!e).map((e) => this.#h(e)).join(", "), s = this.#N();
		this.#s = t, this.emit("change", {
			layout: e.tiles,
			key: t,
			moved: e.moved,
			how: e.how,
			action: n
		});
		let c = a ? r.at(this.#h(a), e.tiles[t]) + "." : "";
		this.#n.textContent = [c, o ? e.how === "swap" ? r.swapped(o) : r.made(o) : ""].filter(Boolean).join(" "), this.#L(s);
	}
	#L(e) {
		requestAnimationFrame(() => {
			this.#v(), this.#s = null, clearTimeout(this.#u);
			let t = [...this.#r.values()].filter((e) => e.el.isConnected);
			this.#M(t, (e) => this.#p(e.item) ?? void 0, e);
			for (let e of t) e.el.classList.remove("lift", "sizing");
			this.#b(s(this.layout));
			let n = t.length && parseFloat(getComputedStyle(t[0].el).transitionDuration) * 1e3 || 0;
			this.#u = window.setTimeout(() => {
				if (!this.#o) for (let e of t) e.el.classList.remove("shift");
			}, n + 30);
		});
	}
};
n("ewo-tile-grid", S);
//#endregion
export { S as EwoTileGrid };
