//#region packages/elements/src/card-paper.ts
function e(e = {}) {
	let t = e.size ?? 160, n = e.light ?? 255, r = e.dark ?? 205;
	try {
		let i = document.createElement("canvas");
		i.width = i.height = t;
		let a = i.getContext("2d");
		if (!a) return "";
		let o = a.createImageData(t, t);
		for (let e = 0; e < o.data.length; e += 4) {
			let t = r + Math.random() * (n - r);
			o.data[e] = o.data[e + 1] = o.data[e + 2] = t, o.data[e + 3] = 255;
		}
		a.putImageData(o, 0, 0);
		let s = i.toDataURL(), c = e.property === void 0 ? "--grain" : e.property;
		return c && document.documentElement.style.setProperty(c, `url(${s})`), s;
	} catch {
		return "";
	}
}
//#endregion
export { e as paperGrain };
