//#region packages/elements/src/card-tilt.ts
var e = (e) => typeof matchMedia == "function" ? matchMedia(e) : null, t = e("(prefers-reduced-motion: reduce)"), n = e("(hover: none) and (pointer: coarse)"), r = typeof DeviceOrientationEvent > "u" ? null : DeviceOrientationEvent, i = Promise.resolve(!r?.requestPermission), a = !1;
function o() {
	!a && r?.requestPermission && n?.matches && !t?.matches && (a = !0, i = r.requestPermission().then((e) => e === "granted", () => !1));
}
function s(e, r = {}) {
	if (t?.matches) return { destroy() {} };
	let a = r.max ?? 16, o = r.perspective ?? 900, s = (e) => Math.max(-a, Math.min(a, e)), c = e.querySelector(".glare"), l = () => e.querySelectorAll(".foil"), u = 0, d = 0, f = 0, p = 0, m = 0, h = null, g = () => {
		f += (u - f) * .14, p += (d - p) * .14, e.style.transform = `perspective(${o}px) rotateX(${p.toFixed(2)}deg) rotateY(${f.toFixed(2)}deg)`, c && (c.style.transform = `translate(${(f * -2.4).toFixed(1)}%, ${(p * 2.4).toFixed(1)}%)`, c.style.opacity = Math.min(.75, (Math.abs(f) + Math.abs(p)) / 16).toFixed(3));
		for (let e of l()) {
			let t = Number(e.dataset.k) || 9;
			e.setAttribute("gradientTransform", `translate(${(f * t).toFixed(1)} ${(-p * t).toFixed(1)})`);
		}
		m = Math.abs(u - f) + Math.abs(d - p) > .02 ? requestAnimationFrame(g) : 0;
	}, _ = () => {
		m ||= requestAnimationFrame(g);
	}, v = () => {
		u = 0, d = 0, _();
	}, y = !1, b = (e) => {
		e.beta !== null && e.gamma !== null && (y = !0, h ??= {
			b: e.beta,
			g: e.gamma
		}, h.b += (e.beta - h.b) * .02, h.g += (e.gamma - h.g) * .02, u = s((e.gamma - h.g) * .9), d = s((h.b - e.beta) * .9), _());
	}, x = null, S = (t) => {
		t.pointerType === "mouse" || y || (x = {
			x: t.clientX,
			y: t.clientY
		}, e.setPointerCapture?.(t.pointerId));
	}, C = (t) => {
		if (t.pointerType === "mouse") {
			let n = e.getBoundingClientRect();
			u = s(((t.clientX - n.left) / n.width - .5) * 2 * a), d = s((.5 - (t.clientY - n.top) / n.height) * 2 * a), _();
		} else x && (u = s((t.clientX - x.x) * .25), d = s(-(t.clientY - x.y) * .25), _());
	}, w = () => {
		x = null, v();
	}, T = (e) => e.pointerType === "mouse" && w(), E = !1, D = !1, O = (e) => {
		e !== E && (E = e, e ? addEventListener("deviceorientation", b) : removeEventListener("deviceorientation", b));
	}, k = () => {
		document.hidden ? (O(!1), h = null, v()) : n?.matches && i.then((e) => e && !D && !document.hidden && O(!0));
	};
	return k(), document.addEventListener("visibilitychange", k), e.addEventListener("pointerdown", S), e.addEventListener("pointermove", C), e.addEventListener("pointerup", w), e.addEventListener("pointercancel", w), e.addEventListener("pointerleave", T), { destroy() {
		D = !0, cancelAnimationFrame(m), O(!1), document.removeEventListener("visibilitychange", k), e.removeEventListener("pointerdown", S), e.removeEventListener("pointermove", C), e.removeEventListener("pointerup", w), e.removeEventListener("pointercancel", w), e.removeEventListener("pointerleave", T);
	} };
}
//#endregion
export { o as askTilt, s as tilt };
