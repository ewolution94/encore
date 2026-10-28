import { EwoElement as e, css as t, define as n, reducedMotion as r } from "./base.js";
import { reelMotion as i } from "./reel-strip.js";
//#region packages/elements/src/slot-reel.ts
var a = t`
  :host {
    --_row: var(--ewo-reel-row, 84px);
    --_rows: 1;
    --_fade: var(--ewo-reel-fade, 22%);
    display: block;
    position: relative;
  }
  :host([rows='3']) { --_rows: 3; --_fade: var(--ewo-reel-fade, 30%); }
  .window {
    position: relative;
    height: calc(var(--_row) * var(--_rows));
    overflow: hidden;
    border-radius: inherit;
  }
  :host([spinning]) .window,
  :host([rows='3']) .window {
    -webkit-mask-image: linear-gradient(transparent, #000 var(--_fade), #000 calc(100% - var(--_fade)), transparent);
    mask-image: linear-gradient(transparent, #000 var(--_fade), #000 calc(100% - var(--_fade)), transparent);
  }
  .track { will-change: transform; }
  .track[data-blur='1'] { filter: blur(0.8px); }
  .track[data-blur='2'] { filter: blur(1.8px); }
  ::slotted(*) { height: var(--_row); }
  .sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background: linear-gradient(105deg, transparent 32%, var(--ewo-reel-sheen, rgb(255 255 255 / 0.5)) 50%, transparent 68%);
    transform: translateX(-110%);
  }
`, o = class extends e {
	static styles = [a];
	static observedAttributes = ["rest", "rows"];
	track;
	sheen;
	strip;
	running = null;
	motion = null;
	frame = 0;
	landedTimer = 0;
	constructor() {
		super(), this.root.innerHTML = "<div class=\"window\" part=\"window\"><div class=\"track\" part=\"track\"><slot></slot></div><div class=\"sheen\" part=\"sheen\"></div></div>", this.track = this.root.querySelector(".track"), this.sheen = this.root.querySelector(".sheen"), this.strip = this.root.querySelector("slot"), this.strip.addEventListener("slotchange", () => {
			this.running || this.place(this.rest);
		});
	}
	get rest() {
		return Math.max(0, Number(this.getAttribute("rest")) || 0);
	}
	set rest(e) {
		this.setAttribute("rest", String(e));
	}
	get spinning() {
		return this.running !== null;
	}
	connectedCallback() {
		this.place(this.rest);
	}
	disconnectedCallback() {
		this.motion?.cancel(), cancelAnimationFrame(this.frame), clearTimeout(this.landedTimer);
	}
	attributeChangedCallback() {
		this.running || this.place(this.rest);
	}
	spin(e = {}) {
		return this.running ??= this.run(e).finally(() => {
			this.running = null;
		}), this.running;
	}
	rows() {
		return this.strip.assignedElements();
	}
	rowHeight() {
		return this.rows()[0]?.offsetHeight || parseFloat(getComputedStyle(this).getPropertyValue("--ewo-reel-row")) || 84;
	}
	offset(e, t) {
		return (+(this.getAttribute("rows") === "3") - e) * t;
	}
	place(e) {
		let t = this.rows().length;
		if (!t) return;
		let n = Math.min(e, t - 1);
		this.track.style.transform = `translate3d(0, ${this.offset(n, this.rowHeight())}px, 0)`;
	}
	async run(e) {
		let t = this.rows().length - 1;
		if (t < 0) return;
		let n = Math.min(e.from ?? this.rest, t), a = Math.min(e.to ?? t, t);
		if (clearTimeout(this.landedTimer), this.removeAttribute("landed"), r() || a === n) {
			this.place(a), this.land(a, !1);
			return;
		}
		let o = this.rowHeight(), { total: s, at: c } = i({
			from: n,
			to: a,
			duration: e.duration,
			tease: e.tease,
			hold: e.hold
		}), l = [];
		for (let e = 0; e < s; e += 16) l.push({
			transform: `translate3d(0, ${this.offset(c(e), o).toFixed(2)}px, 0)`,
			offset: e / s
		});
		l.push({
			transform: `translate3d(0, ${this.offset(a, o)}px, 0)`,
			offset: 1
		}), this.toggleAttribute("spinning", !0), this.motion = this.track.animate(l, {
			duration: s,
			easing: "linear",
			fill: "forwards"
		});
		let u = n, d = n, f = performance.now(), p = (e) => {
			let t = Number(this.motion?.currentTime ?? 0), n = c(t), r = Math.round(n);
			r !== u && (u = r, this.emit("tick", { index: r }));
			let i = Math.abs(n - d) / Math.max(1, e - f);
			d = n, f = e;
			let a = i > .018 ? "2" : i > .007 ? "1" : "0";
			this.track.dataset.blur !== a && (this.track.dataset.blur = a), this.frame = requestAnimationFrame(p);
		};
		this.frame = requestAnimationFrame(p);
		try {
			await this.motion.finished;
		} catch {}
		cancelAnimationFrame(this.frame), this.track.dataset.blur = "0", this.place(a), this.motion?.cancel(), this.motion = null, this.removeAttribute("spinning"), this.land(a, !0);
	}
	land(e, t) {
		this.toggleAttribute("landed", !0), this.landedTimer = window.setTimeout(() => this.removeAttribute("landed"), 900), t && this.isConnected && this.sheen.animate([
			{
				transform: "translateX(-110%)",
				opacity: 0
			},
			{
				transform: "translateX(-20%)",
				opacity: 1,
				offset: .45
			},
			{
				transform: "translateX(110%)",
				opacity: 0
			}
		], {
			duration: 650,
			easing: "cubic-bezier(0.3, 0, 0.3, 1)"
		}), this.emit("land", { index: e });
	}
};
n("ewo-slot-reel", o);
//#endregion
export { o as EwoSlotReel };
