import { pageLanguage as e } from "./base.js";
import { holdPress as t, releasePress as n } from "./press.js";
//#region packages/elements/src/waiting.ts
var r = 150, i = 1200, a = 6e3, o = 12e3, s = 1e4, c = 380, l = 72, u = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 12a8 8 0 1 1-2.6-5.9\"/><path d=\"M20 4v5h-5\"/></svg>", d = {
	de: {
		slow: "Dauert länger …",
		retry: "Nochmal",
		failed: "Hat nicht geklappt."
	},
	en: {
		slow: "Taking longer …",
		retry: "Try again",
		failed: "That didn’t work."
	}
}, f = class extends Error {
	code = "timeout";
	constructor() {
		super("No answer in time"), this.name = "TimeoutError";
	}
}, p = () => {
	let e = document.createElement("span");
	return e.append(document.createElement("i"), document.createElement("i"), document.createElement("i")), e;
};
function m(e) {
	let { mark: t } = e;
	typeof t == "string" ? p = () => {
		let e = document.createElement("template");
		return e.innerHTML = t.trim(), e.content.cloneNode(!0);
	} : t && (p = t);
}
function h(e) {
	if (e instanceof f || e instanceof TypeError) return !0;
	let t = e;
	return t?.name === "AbortError" || t?.name === "TimeoutError" || t?.code === "offline" || t?.code === "busy" || t?.code === "timeout" || typeof t?.status == "number" && (t.status >= 500 || t.status === 0);
}
var g = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new WeakMap();
async function v(t, n, r = {}) {
	let i = t ?? null;
	if (i?.hasAttribute("data-pending")) return;
	M();
	let a = d[e()], s = new AbortController(), c = 0, l = new Promise((e, t) => {
		c = window.setTimeout(() => {
			s.abort(new f()), t(new f());
		}, r.timeout ?? o);
	});
	i && y(i, r, a);
	try {
		let e = await Promise.race([n(s.signal), l]);
		return i && w(i), e;
	} catch (e) {
		let t = s.signal.aborted && !(e instanceof f) ? new f() : e;
		throw i && ((r.retryable ?? h)(t) ? E(i, r.retry ?? a.retry, a.failed) : T(i)), t;
	} finally {
		clearTimeout(c);
	}
}
function y(e, n, o) {
	D(e), e.setAttribute("data-pending", ""), e.setAttribute("aria-busy", "true"), t(e);
	let s = document.createElement("span");
	s.className = "ewo-wait", s.setAttribute("aria-hidden", "true");
	let c = document.createElement("span");
	c.className = "ewo-wait-mark", c.append(p());
	let l = document.createElement("span");
	l.className = "ewo-wait-retry", l.innerHTML = u;
	let d = document.createElement("span");
	d.className = "ewo-wait-text", s.append(c, l, d);
	let f = {
		overlay: s,
		text: d,
		retry: l,
		timers: [],
		position: null
	};
	g.set(e, f);
	let m = (t, n) => {
		g.has(e) && (s.isConnected || (f.position = b(e), e.append(s)), e.setAttribute("data-wait", t), n !== void 0 && (d.textContent = n, x(e, s, d), A(n)));
	};
	f.timers.push(window.setTimeout(() => m("busy"), r), window.setTimeout(() => n.label && m("words", n.label), i), window.setTimeout(() => m("slow", n.slow ?? o.slow), a));
}
function b(e) {
	let t = getComputedStyle(e), n = e;
	n.style.setProperty("--ewo-wait-fg", t.color);
	let r = n.style.position || null;
	return t.position === "static" && (n.style.position = "relative"), r;
}
function x(e, t, n) {
	t.removeAttribute("data-bubble"), n.textContent && (e.clientWidth < l || n.scrollWidth > n.clientWidth + 1) && t.setAttribute("data-bubble", "");
}
function S(e, t, n) {
	t.remove();
	let r = e;
	r.style.removeProperty("--ewo-wait-fg"), n === null ? r.style.removeProperty("position") : r.style.position = n;
}
function C(e) {
	let t = g.get(e);
	return g.delete(e), t && t.timers.forEach(clearTimeout), e.removeAttribute("data-pending"), e.removeAttribute("aria-busy"), e.removeAttribute("data-wait"), t;
}
function w(e) {
	let t = C(e);
	t && S(e, t.overlay, t.position), n(e);
}
function T(e) {
	w(e), O(e);
}
function E(e, t, r) {
	let i = C(e);
	if (n(e), !i) return;
	i.overlay.isConnected || (i.position = b(e), e.append(i.overlay)), i.text.textContent = t, e.setAttribute("data-wait", "failed"), i.overlay.toggleAttribute("data-narrow", e.clientWidth < l), x(e, i.overlay, i.text), O(e), A(`${r} ${t}?`);
	let a = window.setTimeout(() => D(e), s);
	_.set(e, {
		overlay: i.overlay,
		timer: a,
		position: i.position
	});
}
function D(e) {
	let t = _.get(e);
	t && (_.delete(e), clearTimeout(t.timer), e.getAttribute("data-wait") === "failed" && e.removeAttribute("data-wait"), S(e, t.overlay, t.position));
}
function O(e) {
	e.removeAttribute("data-shake"), e.offsetWidth, e.setAttribute("data-shake", ""), window.setTimeout(() => e.removeAttribute("data-shake"), c);
}
var k = null;
function A(e) {
	(!k || !k.isConnected) && (k = document.createElement("div"), k.setAttribute("aria-live", "polite"), k.setAttribute("role", "status"), k.className = "ewo-wait-live", document.body.append(k)), k.textContent = "";
	let t = k;
	requestAnimationFrame(() => t.textContent = e);
}
var j = !1;
function M() {
	if (j) return;
	j = !0;
	let e = new CSSStyleSheet();
	e.replaceSync(N), document.adoptedStyleSheets = [...document.adoptedStyleSheets, e];
}
var N = `
@layer ewo-wait {
  /* While the overlay shows, the control's own label steps aside (text and children), keeping its size. */
  [data-wait] { color: transparent !important; }
  [data-wait] > :not(.ewo-wait) { visibility: hidden; }
  .ewo-wait {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45em;
    padding: 0 0.6em;
    border-radius: inherit;
    color: var(--ewo-wait-fg, currentColor);
    font: inherit;
    line-height: 1.1;
    white-space: nowrap;
    pointer-events: none;
    animation: ewo-wait-in 140ms ease-out;
  }
  .ewo-wait-text { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  .ewo-wait-text:empty { display: none; }
  /* Words too long for the control: a small bubble just under it. */
  .ewo-wait[data-bubble] .ewo-wait-text {
    position: absolute;
    top: calc(100% + 6px);
    left: 50%;
    z-index: 5;
    max-width: none;
    translate: -50% 0;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--ewo-wait-bubble-bg, var(--ewo-fg, #222));
    color: var(--ewo-wait-bubble-fg, var(--ewo-bg, #fff));
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0;
    text-transform: none;
    box-shadow: 0 6px 16px -8px rgb(0 0 0 / 0.5);
    animation: ewo-wait-in 140ms ease-out;
  }
  .ewo-wait-retry { display: none; width: 1.1em; height: 1.1em; flex: none; }
  .ewo-wait-retry svg { display: block; width: 100%; height: 100%; }
  [data-wait='failed'] .ewo-wait-retry { display: block; }
  .ewo-wait-mark { flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.2em; height: 1em; }
  .ewo-wait-mark > span { display: inline-flex; align-items: center; gap: 0.2em; }
  .ewo-wait-mark i { width: 0.3em; height: 0.3em; border-radius: 50%; background: currentColor; animation: ewo-wait-dot 900ms ease-in-out infinite; }
  .ewo-wait-mark i:nth-child(2) { animation-delay: 150ms; }
  .ewo-wait-mark i:nth-child(3) { animation-delay: 300ms; }
  [data-wait='failed'] .ewo-wait-mark { display: none; }
  [data-shake] { animation: ewo-wait-shake ${c}ms ease-in-out; }
  .ewo-wait-live { position: fixed; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @keyframes ewo-wait-in { from { opacity: 0; } }
  @keyframes ewo-wait-dot { 0%, 80%, 100% { opacity: 0.3; scale: 0.75; } 40% { opacity: 1; scale: 1; } }
  @keyframes ewo-wait-shake { 20% { translate: -5px 0; } 40% { translate: 5px 0; } 60% { translate: -3px 0; } 80% { translate: 2px 0; } }
  @media (prefers-reduced-motion: reduce) {
    .ewo-wait-mark i { animation: none; opacity: 0.75; }
    [data-shake] { animation: none; }
    .ewo-wait { animation: none; }
  }
}
`;
//#endregion
export { N as WAIT_CSS, f as WaitTimeout, m as configureWaiting, h as isRetryable, v as track };
