import { EwoElement as e, css as t, define as n, onPageLanguage as r, pageLanguage as i } from "./base.js";
import { decimals as a, fractionOf as o, pageStep as s, scaleOf as c, snap as l, stepCount as u, valueAt as d } from "./slider-scale.js";
//#region packages/elements/src/slider.ts
var f = t`
  :host {
    --_knob: var(--ewo-slider-knob-size, 22px);
    --_track: var(--ewo-slider-track-height, 6px);
    --_fill: var(--ewo-slider-fill, var(--ewo-accent));
    display: block;
    min-width: 120px;
    color: var(--ewo-fg);
    user-select: none;
    -webkit-user-select: none;
  }
  /* !important: a page's own :focus-visible outline (Folio's base.css has one) beats a :host rule,
     and drew a box round the whole element after any key press. The inner ring stays. */
  :host(:focus-visible) { outline: none !important; }
  :host([disabled]) { opacity: 0.5; pointer-events: none; }

  .rail {
    position: relative;
    height: max(32px, calc(var(--_knob) + 12px));
    cursor: pointer;
    touch-action: pan-y;
  }
  :host([dragging]) .rail { cursor: grabbing; }

  .track {
    position: absolute;
    inset-inline: 0;
    top: 50%;
    height: var(--_track);
    margin-top: calc(var(--_track) / -2);
    border-radius: var(--ewo-r-pill);
    background: var(--ewo-slider-track, var(--ewo-fill-3));
    box-shadow: var(--ewo-slider-track-shadow, none);
    overflow: hidden;
  }
  /* The span the knob's centre travels: half a knob in from each end. A size container, so the
     knob and the mark move in cqw: transforms only, and nothing is measured. */
  .lane { position: absolute; inset-block: 0; inset-inline: calc(var(--_knob) / 2); }
  .rail > .lane { container-type: inline-size; }
  .cap { position: absolute; inset-block: 0; left: 0; width: calc(var(--_knob) / 2 + 1px); background: var(--_fill); }
  .fill {
    position: absolute;
    inset: 0;
    background: var(--_fill);
    transform-origin: 0 50%;
    transform: scaleX(0);
  }
  .ticks {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-inline: -1px;
  }
  .ticks i {
    flex: none;
    width: max(2px, calc(var(--_track) / 3));
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--ewo-slider-tick, color-mix(in srgb, currentColor 28%, transparent));
  }
  :host(:not([ticks])) .ticks { display: none; }

  /* Zero-wide anchors moved by translateX in cqw of the lane. A full-width box shifted right would
     stick out of whatever scrolls around the slider: iOS then scrolled a sheet sideways and took
     the finger's drag over (2026-10-22, Randomiser's Settings in the iOS Simulator). */
  .at { position: absolute; inset-block: 0; left: 0; width: 0; pointer-events: none; }
  .notch {
    position: absolute;
    left: -5px;
    top: calc(50% + var(--_track) / 2 + 3px);
    border: 5px solid transparent;
    border-top: 0;
    border-bottom: 6px solid var(--ewo-slider-mark, var(--ewo-fg-3));
  }
  .mark[hidden] { display: none; }
  .knob {
    position: absolute;
    left: calc(var(--_knob) / -2);
    top: 50%;
    width: var(--_knob);
    height: var(--_knob);
    margin-top: calc(var(--_knob) / -2);
    border-radius: 50%;
    background: var(--ewo-slider-knob, var(--ewo-bg-raised, #fff));
    box-shadow: var(--ewo-slider-knob-shadow, 0 0 0 1px var(--ewo-line-strong), 0 1px 3px rgb(0 0 0 / 0.28));
    pointer-events: auto;
    cursor: grab;
    transition: scale 160ms var(--ewo-ease);
  }
  :host([dragging]) .knob { scale: 1.14; cursor: grabbing; }
  @media (hover: hover) {
    .rail:hover .knob { scale: 1.06; }
    :host([dragging]) .rail:hover .knob { scale: 1.14; }
  }
  :host(:focus-visible) .knob { outline: var(--ewo-focus); outline-offset: 3px; }

  .bubble {
    position: absolute;
    left: 0;
    bottom: calc(50% + var(--_knob) / 2 + 9px);
    translate: -50% 4px;
    scale: 0.92;
    opacity: 0;
    padding: 5px 9px;
    border-radius: 8px;
    background: var(--ewo-slider-bubble, var(--ewo-invert));
    color: var(--ewo-slider-bubble-ink, var(--ewo-invert-ink));
    font: 600 12px/1 var(--ewo-sans);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    transform-origin: 50% 100%;
    transition:
      opacity 120ms var(--ewo-ease),
      translate 180ms var(--ewo-ease-spring),
      scale 180ms var(--ewo-ease-spring);
  }
  .bubble::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border: 5px solid transparent;
    border-bottom: 0;
    border-top-color: var(--ewo-slider-bubble, var(--ewo-invert));
  }
  :host([dragging]) .bubble,
  :host(:focus-visible) .bubble { opacity: 1; translate: -50% 0; scale: 1; }
  :host([nobubble]) .bubble { display: none; }

  /* Gliding onto a step after a drag, or to a value set from outside; never while dragging. */
  .slide, .fill { transition: transform 220ms var(--ewo-ease-spring); }
  :host([dragging]) .slide, :host([dragging]) .fill { transition: none; }

  .ends {
    display: flex;
    justify-content: space-between;
    margin-top: -2px;
    font: 600 11px/1.2 var(--ewo-sans);
    color: var(--ewo-fg-3);
    font-variant-numeric: tabular-nums;
  }
  :host(:not([ends])) .ends { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .slide, .fill, .knob, .bubble { transition: none; }
    :host([dragging]) .knob, .rail:hover .knob { scale: none; }
  }
`, p = .25, m = class extends e {
	static styles = [f];
	static formAssociated = !0;
	static observedAttributes = [
		"value",
		"min",
		"max",
		"step",
		"mark",
		"label",
		"unit",
		"disabled"
	];
	#e = this.attachInternals();
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	#c;
	#l;
	#u = null;
	#d = null;
	#f = null;
	constructor() {
		super(), this.root.innerHTML = "\n      <div class=\"rail\" part=\"rail\">\n        <div class=\"track\" part=\"track\">\n          <span class=\"cap\" part=\"fill\"></span>\n          <div class=\"lane\"><span class=\"fill\" part=\"fill\"></span><span class=\"ticks\" part=\"ticks\"></span></div>\n        </div>\n        <div class=\"lane\">\n          <div class=\"at mark\" hidden><span class=\"notch\" part=\"mark\"></span></div>\n          <div class=\"at slide\"><span class=\"knob\" part=\"knob\"></span><span class=\"bubble\" part=\"bubble\"></span></div>\n        </div>\n      </div>\n      <div class=\"ends\" part=\"ends\" aria-hidden=\"true\"><span></span><span></span></div>";
		let e = (e) => this.root.querySelector(e);
		this.#t = e(".rail"), this.#n = e(".rail > .lane"), this.#r = e(".fill"), this.#i = e(".ticks"), this.#a = e(".mark"), this.#o = e(".slide"), this.#s = e(".knob"), this.#c = e(".bubble"), this.#l = Array.from(this.root.querySelectorAll(".ends span")), this.#e.role = "slider", this.#e.ariaOrientation = "horizontal", this.#t.addEventListener("pointerdown", (e) => this.#_(e)), this.#t.addEventListener("pointermove", (e) => this.#y(e)), this.#t.addEventListener("pointerup", (e) => this.#x(e)), this.#t.addEventListener("pointercancel", (e) => this.#S(e)), this.#t.addEventListener("lostpointercapture", (e) => this.#S(e)), this.addEventListener("keydown", (e) => this.#w(e));
	}
	connectedCallback() {
		this.#f = r(() => this.#h()), this.#h();
	}
	disconnectedCallback() {
		this.#f?.(), this.#f = null, this.#d && this.#C();
	}
	attributeChangedCallback() {
		this.#h();
	}
	get scale() {
		return c(this.#p("min", 0), this.#p("max", 100), this.#p("step", 1));
	}
	get value() {
		let e = this.getAttribute("value");
		return l(e === null ? this.mark ?? this.scale.min : Number(e), this.scale);
	}
	set value(e) {
		this.setAttribute("value", String(e));
	}
	get min() {
		return this.scale.min;
	}
	set min(e) {
		this.setAttribute("min", String(e));
	}
	get max() {
		return this.scale.max;
	}
	set max(e) {
		this.setAttribute("max", String(e));
	}
	get step() {
		return this.scale.step;
	}
	set step(e) {
		this.setAttribute("step", String(e));
	}
	get mark() {
		let e = this.getAttribute("mark");
		return e === null || e === "" || !Number.isFinite(Number(e)) ? null : Number(e);
	}
	set mark(e) {
		e === null ? this.removeAttribute("mark") : this.setAttribute("mark", String(e));
	}
	get label() {
		return this.getAttribute("label") ?? "";
	}
	set label(e) {
		this.setAttribute("label", e);
	}
	get disabled() {
		return this.flag("disabled");
	}
	set disabled(e) {
		this.flag("disabled", e);
	}
	get format() {
		return this.#u;
	}
	set format(e) {
		this.#u = e, this.#h();
	}
	formResetCallback() {
		this.removeAttribute("value");
	}
	text(e = this.value) {
		if (this.#u) return this.#u(e);
		let t = new Intl.NumberFormat(i() === "de" ? "de-DE" : "en-GB", { maximumFractionDigits: a(this.scale.step) }).format(e), n = this.getAttribute("unit");
		return n ? `${t} ${n}` : t;
	}
	#p(e, t) {
		let n = this.getAttribute(e), r = n === null || n === "" ? NaN : Number(n);
		return Number.isFinite(r) ? r : t;
	}
	#m(e) {
		this.#o.style.transform = `translateX(${(e * 100).toFixed(3)}cqw)`, this.#r.style.transform = `scaleX(${e.toFixed(5)})`;
	}
	#h() {
		let e = this.scale, t = this.value, n = this.text(t);
		this.#c.textContent = n, this.#l[0].textContent = this.text(e.min), this.#l[1].textContent = this.text(e.max);
		let r = u(e), i = r <= 100 ? r + 1 : 0;
		this.#i.childElementCount !== i && this.#i.replaceChildren(...Array.from({ length: i }, () => document.createElement("i")));
		let a = this.mark;
		this.#a.hidden = a === null, a !== null && (this.#a.style.transform = `translateX(${(o(l(a, e), e) * 100).toFixed(3)}cqw)`), this.#d?.active || this.#m(o(t, e));
		let s = this.#e;
		s.ariaValueMin = String(e.min), s.ariaValueMax = String(e.max), s.ariaValueNow = String(t), s.ariaValueText = n, s.ariaLabel = this.label || null, s.ariaDisabled = this.disabled ? "true" : null, s.setFormValue(String(t)), this.disabled ? this.removeAttribute("tabindex") : !this.hasAttribute("tabindex") && this.isConnected && (this.tabIndex = 0);
	}
	#g(e) {
		return e !== this.value && (this.setAttribute("value", String(e)), this.emit("input", { value: e }), !0);
	}
	#_(e) {
		if (this.disabled || this.#d || e.pointerType === "mouse" && e.button !== 0) return;
		let t = this.#n.getBoundingClientRect(), n = e.composedPath().includes(this.#s), r = t.left + o(this.value, this.scale) * t.width;
		this.#d = {
			id: e.pointerId,
			left: t.left,
			width: Math.max(1, t.width),
			offset: n ? r - e.clientX : 0,
			start: this.value,
			x0: e.clientX,
			touch: e.pointerType !== "mouse",
			active: !1,
			onKnob: n
		};
		try {
			this.#t.setPointerCapture(e.pointerId);
		} catch {}
		this.#d.touch || (e.preventDefault(), this.focus({ preventScroll: !0 }), this.#v(), this.#b(e.clientX));
	}
	#v() {
		this.#d.active = !0, this.setAttribute("dragging", "");
	}
	#y(e) {
		let t = this.#d;
		if (t && e.pointerId === t.id) {
			if (!t.active) {
				if (Math.abs(e.clientX - t.x0) < 3) return;
				this.#v();
			}
			this.#b(e.clientX);
		}
	}
	#b(e) {
		let t = this.#d, n = this.scale, r = Math.min(1, Math.max(0, (e + t.offset - t.left) / t.width)), i = d(r, n), a = u(n) <= 100 ? p : 0;
		this.#m(r + (o(i, n) - r) * a), this.#g(i);
	}
	#x(e) {
		let t = this.#d;
		t && e.pointerId === t.id && (!t.active && !t.onKnob && this.#g(d((e.clientX - t.left) / t.width, this.scale)), this.#C());
	}
	#S(e) {
		let t = this.#d;
		t && e.pointerId === t.id && this.#C();
	}
	#C() {
		let e = this.#d;
		this.#d = null, e && this.#t.hasPointerCapture(e.id) && this.#t.releasePointerCapture(e.id), this.removeAttribute("dragging"), this.#m(o(this.value, this.scale)), e && this.value !== e.start && this.emit("change", { value: this.value });
	}
	#w(e) {
		if (this.disabled || e.altKey || e.ctrlKey || e.metaKey) return;
		let t = this.scale, n = this.value, r = e.key === "ArrowRight" || e.key === "ArrowUp" ? n + t.step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? n - t.step : e.key === "PageUp" ? n + s(t) : e.key === "PageDown" ? n - s(t) : e.key === "Home" ? t.min : e.key === "End" ? t.max : null;
		r !== null && (e.preventDefault(), this.#g(l(r, t)) && this.emit("change", { value: this.value }));
	}
};
n("ewo-slider", m);
//#endregion
export { m as EwoSlider };
