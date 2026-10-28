import { EwoElement as e, css as t, define as n } from "./base.js";
import { TAG_COLOURS as r } from "./emblem-tag.js";
import { emblemSvg as i, emblemTheme as a, parseEmblem as o } from "./emblem-core.js";
//#region packages/elements/src/emblem.ts
var s = t`
  :host {
    --_e1: var(--ewo-emblem-1, #232a6e);
    --_e2: var(--ewo-emblem-2, var(--ewo-accent));
    --_e3: var(--ewo-emblem-3, #f4ecda);
    --_ink: var(--ewo-emblem-ink, var(--ewo-fg));
    --_strike: var(--ewo-emblem-strike, var(--ewo-bad));
    position: relative;
    display: inline-block;
    flex: none;
    width: var(--_size, 48px);
    height: var(--_size, 48px);
    vertical-align: middle;
  }
  .frame { position: absolute; inset: 0; }
  svg { display: block; width: 100%; height: 100%; overflow: visible; }

  .e1 { fill: var(--_e1); }
  .e2 { fill: var(--_e2); }
  .e3 { fill: var(--_e3); }
  .heraldry .charge { fill: var(--_e3); stroke: var(--_e1); stroke-width: 4; stroke-linejoin: round; paint-order: stroke; }
  .heraldry .rim { fill: none; stroke: var(--_ink); stroke-width: 4.5; stroke-linejoin: round; }
  .faded { filter: grayscale(1); opacity: 0.55; }
  .strike { fill: none; stroke: var(--_strike); stroke-width: 9; stroke-linecap: round; }

  /* The price tag: the chosen colour, a darker shade for the pattern, a fixed dark outline. */
  .tag { --_tink: var(--ewo-emblem-tag-ink, #212121); }
  ${r.map(([, e], t) => `.tag .tc${t} { --_e1: var(--ewo-emblem-tag-${t}, ${e}); }`).join("\n  ")}
  .tag .tp { fill: color-mix(in oklab, var(--_e1), #000 20%); }
  .tag .tb { fill: none; stroke: color-mix(in oklab, var(--_e1), #000 20%); stroke-width: 22; }
  .tag .trim { fill: none; stroke: var(--_tink); stroke-width: 4.5; stroke-linejoin: round; }
  .tag .thole { fill: var(--ewo-emblem-paper, #ffffff); stroke: var(--_tink); stroke-width: 3.5; }
  .tag .tf { fill: #ffffff; stroke: var(--_tink); stroke-width: 7; stroke-linejoin: round; paint-order: stroke; }
  .tag .tl { fill: none; stroke: var(--_tink); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
  .tag .ti { fill: #ffffff; stroke: var(--_tink); stroke-width: 3.4; paint-order: stroke; font: 800 40px/1 var(--ewo-sans); }

  /* The doodle's face is round on paper; its crown may rise above the circle. */
  :host([theme='doodle']) { border-radius: 50%; background: var(--ewo-emblem-paper, #ffffff); }
  :host([theme='doodle'][ring]) { box-shadow: 0 0 0 2px var(--_ink); }
  :host([theme='doodle']:not([crown])) .frame { overflow: hidden; border-radius: 50%; }

  /* The agent's bust is a round photo on paper, cropped by its frame. */
  :host([theme='agent']) { border-radius: 50%; background: var(--ewo-emblem-paper, #ffffff); }
  :host([theme='agent'][ring]) { box-shadow: 0 0 0 2px var(--_ink); }
  :host([theme='agent']) .frame { overflow: hidden; border-radius: 50%; }

  /* The boil: the redraws side by side on one strip, stepped past a window one frame wide, like a
     cartoon held still (only themes that redraw). One animation, so a frame is never blank or doubled:
     three stacked frames with their own opacity animations met at the same instant, and a browser
     frame now and then showed none of them, the face blinking out (Kritzle, 2026-10-09). Keep it one
     strip of frames with one stepped animation: don't split it back into stacked frames. The window
     clips sideways only, so a crown can still rise above it. */
  .reel { position: absolute; inset: 0; overflow-x: clip; }
  :host([theme='doodle']:not([crown])) .reel { overflow: hidden; border-radius: 50%; }
  .strip { display: flex; width: calc(var(--_frames) * 100%); height: 100%; animation: boil calc(var(--_frames) * 0.14s) steps(var(--_frames)) infinite; }
  .strip > .frame { position: relative; inset: auto; flex: 0 0 calc(100% / var(--_frames)); height: 100%; }
  @keyframes boil { to { translate: -100% 0; } }
  @media (prefers-reduced-motion: reduce) {
    .strip { animation: none; }
  }
`, c = class extends e {
	static styles = [s];
	static observedAttributes = [
		"theme",
		"value",
		"size",
		"mood",
		"crown",
		"boil",
		"dead",
		"label",
		"initial"
	];
	#e = this.attachInternals();
	#t = [];
	connectedCallback() {
		this.#i();
	}
	attributeChangedCallback(e, t, n) {
		if (t !== n) {
			if (e === "size") return this.#n();
			if (e === "label") return this.#r();
			this.isConnected && this.#i();
		}
	}
	get value() {
		return o(this.getAttribute("value")) ?? [];
	}
	set value(e) {
		this.setAttribute("value", Array.isArray(e) ? e.join(",") : String(e));
	}
	get theme() {
		return a(this.getAttribute("theme")).id;
	}
	set theme(e) {
		this.setAttribute("theme", e);
	}
	get dead() {
		return this.flag("dead");
	}
	set dead(e) {
		this.flag("dead", !!e);
	}
	get boil() {
		return this.flag("boil");
	}
	set boil(e) {
		this.flag("boil", !!e);
	}
	get ring() {
		return this.flag("ring");
	}
	set ring(e) {
		this.flag("ring", !!e);
	}
	get crown() {
		return this.flag("crown");
	}
	set crown(e) {
		this.flag("crown", !!e);
	}
	#n() {
		let e = this.getAttribute("size");
		e ? this.style.setProperty("--_size", /^\d+(\.\d+)?$/.test(e) ? `${e}px` : e) : this.style.removeProperty("--_size");
	}
	#r() {
		let e = this.getAttribute("label");
		this.#e.role = e ? "img" : null, this.#e.ariaLabel = e;
	}
	#i() {
		this.#n(), this.#r();
		let e = a(this.getAttribute("theme")), t = this.hasAttribute("boil") ? e.frames ?? 1 : 1, n = {
			mood: this.getAttribute("mood") ?? "",
			crown: this.hasAttribute("crown"),
			dead: this.hasAttribute("dead"),
			initial: this.getAttribute("initial") ?? ""
		}, r = Array.from({ length: t }, (t, r) => i(e.id, this.value, {
			...n,
			frame: r
		}));
		if (r.length === this.#t.length && r.every((e, t) => e === this.#t[t])) return;
		let o = t > 1 ? this.root.querySelector(".strip") : null;
		o && o.childElementCount === t ? r.forEach((e, t) => {
			e !== this.#t[t] && (o.children[t].innerHTML = e);
		}) : t > 1 ? this.root.innerHTML = `<span class="reel"><span class="strip" style="--_frames:${t}">${r.map((e) => `<span class="frame">${e}</span>`).join("")}</span></span>` : this.root.innerHTML = `<span class="frame">${r[0]}</span>`, this.#t = r;
	}
};
n("ewo-emblem", c);
//#endregion
export { c as EwoEmblem };
