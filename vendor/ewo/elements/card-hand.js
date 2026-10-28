import { cardAt as e } from "./card-fan.js";
//#region packages/elements/src/card-hand.ts
function t(t, n) {
	let r = n.holdMs ?? 480, i = () => n.mode?.() ?? "play", a = null, o = null, s = {
		x: 0,
		y: 0,
		t: 0,
		vx: 0,
		vy: 0,
		ox: 0,
		oy: 0
	}, c = 0, l = (e) => {
		let n = t.getBoundingClientRect();
		return {
			x: e.clientX - n.left,
			y: e.clientY - n.top
		};
	}, u = (t, r) => {
		let i = n.raised?.(), a = n.lifted(), o = i ? /* @__PURE__ */ new Set([...i, ...a ? [a] : []]) : a;
		return e(n.fan(), t, r, o);
	}, d = (e) => {
		o = e, n.drag?.(e);
	}, f = (e) => n.refuse?.(e);
	function p(e) {
		if (e.button > 0 || n.enabled && !n.enabled() || !n.fan().places.size) return;
		t.setPointerCapture?.(e.pointerId);
		let s = l(e), d = u(s.x, s.y);
		a = {
			x: s.x,
			y: s.y,
			key: d,
			was: n.lifted(),
			moved: !1,
			refused: !1
		}, d && i() === "play" && n.lift(d), clearTimeout(c), c = window.setTimeout(() => {
			if (a && !a.moved && !o && a.key && n.inspect) {
				let e = a.key;
				a = null, n.inspect(e);
			}
		}, r);
	}
	function m(e) {
		if (!a) return;
		let t = l(e), r = performance.now();
		if (o) {
			let e = Math.max(1, r - s.t);
			s.vx = s.vx * .6 + (t.x - s.x) / e * .4, s.vy = s.vy * .6 + (t.y - s.y) / e * .4, s = {
				...s,
				x: t.x,
				y: t.y,
				t: r
			}, d({
				key: o.key,
				x: t.x - s.ox,
				y: t.y - s.oy,
				r: Math.max(-18, Math.min(18, s.vx * 22))
			});
			return;
		}
		if (Math.hypot(t.x - a.x, t.y - a.y) > 7 && (a.moved = !0, clearTimeout(c)), i() === "select") return;
		let p = n.lifted();
		if (p && a.y - t.y > 22) {
			if (n.canPlay() && n.playable(p)) {
				let e = n.fan(), i = e.places.get(p);
				if (!i) return;
				s = {
					x: t.x,
					y: t.y,
					t: r,
					vx: 0,
					vy: 0,
					ox: t.x - i.x,
					oy: t.y - (i.y - e.lift)
				}, d({
					key: p,
					x: i.x,
					y: i.y - e.lift,
					r: i.r
				});
			} else n.canPlay() && !a.refused && (a.refused = !0, f(p));
			return;
		}
		let m = u(t.x, t.y);
		m && m !== p && n.lift(m);
	}
	function h() {
		if (clearTimeout(c), o) {
			let e = o.key;
			(o.y + n.fan().ch / 2 < 0 || s.vy < -.5) && n.play(e), d(null);
		} else a && a.key && !a.moved && (i() === "select" ? n.toggle?.(a.key) : a.key === a.was && _(a.key));
		a = null;
	}
	function g() {
		clearTimeout(c), o && d(null), a = null;
	}
	function _(e) {
		if (n.canPlay()) {
			if (!n.playable(e)) return f(e);
			n.play(e);
		}
	}
	let v = (e) => e.preventDefault();
	return t.addEventListener("pointerdown", p), t.addEventListener("pointermove", m), t.addEventListener("pointerup", h), t.addEventListener("pointercancel", g), t.addEventListener("contextmenu", v), { destroy() {
		clearTimeout(c), t.removeEventListener("pointerdown", p), t.removeEventListener("pointermove", m), t.removeEventListener("pointerup", h), t.removeEventListener("pointercancel", g), t.removeEventListener("contextmenu", v);
	} };
}
//#endregion
export { t as handGestures };
