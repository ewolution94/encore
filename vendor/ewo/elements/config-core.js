//#region packages/elements/src/config-core.ts
var e = {
	lang: {
		type: "enum",
		options: [
			"system",
			"de",
			"en"
		],
		labels: {
			system: {
				en: "System",
				de: "System"
			},
			de: "Deutsch",
			en: "English"
		},
		default: "system",
		label: {
			en: "Language",
			de: "Sprache"
		}
	},
	theme: {
		type: "enum",
		options: [
			"system",
			"light",
			"dark"
		],
		labels: {
			system: {
				en: "System",
				de: "System"
			},
			light: {
				en: "Light",
				de: "Hell"
			},
			dark: {
				en: "Dark",
				de: "Dunkel"
			}
		},
		default: "system",
		label: {
			en: "Theme",
			de: "Design"
		}
	},
	sounds: {
		type: "bool",
		default: !1,
		label: {
			en: "Sounds",
			de: "Töne"
		}
	},
	motion: {
		type: "enum",
		options: [
			"system",
			"less",
			"full"
		],
		labels: {
			system: {
				en: "System",
				de: "System"
			},
			less: {
				en: "Less",
				de: "Weniger"
			},
			full: {
				en: "Full",
				de: "Voll"
			}
		},
		default: "system",
		label: {
			en: "Motion",
			de: "Bewegung"
		}
	}
}, t = (e) => e.family === !0;
function n(n, r) {
	return t(r) ? e[n] : r;
}
function r(e, t, n = "") {
	return e === void 0 ? n : typeof e == "string" ? e : (t === "de" ? e.de : void 0) ?? e.en ?? n;
}
var i = (e) => typeof e == "object" && !!e && !Array.isArray(e), a = (e) => e.ids.map((e) => e.id);
function o(e, t, n) {
	if (!Array.isArray(e)) return;
	let r = /* @__PURE__ */ new Set(), i = [];
	for (let n of e) typeof n == "string" && t.includes(n) && !r.has(n) && (r.add(n), i.push(n));
	for (let e of n) r.has(e) || (r.add(e), i.push(e));
	return i;
}
function s(e, t, n = [1, 1]) {
	if (!Array.isArray(e) || e.length !== 4 || !e.every((e) => Number.isInteger(e))) return;
	let [r, i, a, o] = e;
	if (!(r < 1 || i < 1 || i > 200 || a < n[0] || o < n[1] || o > 50 || r + a - 1 > t)) return [
		r,
		i,
		a,
		o
	];
}
var c = (e, t) => e[0] < t[0] + t[2] && t[0] < e[0] + e[2] && e[1] < t[1] + t[3] && t[1] < e[1] + e[3];
function l(e, t) {
	switch (e.type) {
		case "bool": return typeof t == "boolean" ? t : void 0;
		case "enum": return (typeof t == "string" || typeof t == "number") && e.options.includes(t) ? t : void 0;
		case "int":
		case "number": return typeof t != "number" || !Number.isFinite(t) || e.type === "int" && !Number.isInteger(t) || t < (e.min ?? -Infinity) || t > (e.max ?? Infinity) ? void 0 : t;
		case "text": {
			if (typeof t != "string") return;
			let n = e.multiline ? t.replace(/\r\n?/g, "\n") : t.replace(/[\r\n]+/g, " ");
			return n.length <= (e.maxLength ?? 200) ? n : void 0;
		}
		case "order": return o(t, a(e), e.default ?? a(e));
		case "pick": {
			if (!Array.isArray(t) || t.length !== e.n) return;
			let n = a(e);
			return t.every((e) => typeof e == "string" && n.includes(e)) && new Set(t).size === t.length ? t : void 0;
		}
		case "items": {
			if (!Array.isArray(t)) return;
			let n = a(e), r = /* @__PURE__ */ new Set(), o = [], s = (t, n) => {
				let r = { id: n };
				for (let [n, i] of Object.entries(e.fields)) r[n] = l(i, t[n]) ?? i.default;
				return r;
			};
			for (let e of t) i(e) && typeof e.id == "string" && n.includes(e.id) && !r.has(e.id) && (r.add(e.id), o.push(s(e, e.id)));
			let c = (e.default ?? []).map((e) => e.id).filter((e) => n.includes(e));
			for (let t of [...c, ...n]) r.has(t) || (r.add(t), o.push(s(e.default?.find((e) => e.id === t) ?? {}, t)));
			return o;
		}
		case "layout": return u(e, t);
	}
}
function u(e, t) {
	if (!i(t)) return;
	let n = new Map(e.tiles.map((e) => [e.id, e])), r = {};
	for (let [a, o] of Object.entries(e.grids)) {
		let l = t[a];
		if (!i(l)) return;
		let u = { columns: o.columns };
		for (let t of e.groups) {
			let e = l[t.id] ?? {};
			if (!i(e)) return;
			let r = {};
			for (let [i, a] of Object.entries(e)) {
				let e = n.get(i);
				if (!e || e.group !== t.id) continue;
				let l = s(a, o.columns, e.min);
				if (!l || Object.values(r).some((e) => c(e, l))) return;
				r[i] = l;
			}
			u[t.id] = r;
		}
		r[a] = u;
	}
	let a = i(t.narrow) ? t.narrow : {}, l = {};
	if (i(a.heights)) for (let [t, r] of Object.entries(a.heights)) n.has(t) && typeof r == "number" && (e.heights ?? []).includes(r) && (l[t] = r);
	let u = {};
	for (let t of e.groups) {
		let n = e.tiles.filter((e) => e.group === t.id).map((e) => e.id), r = i(a.order) ? a.order[t.id] : void 0;
		u[t.id] = o(r ?? [], n, n) ?? n;
	}
	return r.narrow = {
		base: d(e),
		heights: l,
		order: u
	}, r;
}
function d(e) {
	let t = i(e.default?.narrow) ? e.default.narrow : {};
	return e.base ?? (typeof t.base == "number" ? t.base : 0);
}
function f(e, r) {
	let i = n(e, r);
	if (i) return t(r) ? l(i, r.fixed) ?? l(i, r.default) ?? l(i, i.default) : i.type === "order" ? i.default ?? a(i) : i.type === "items" ? l(i, i.default ?? []) : l(i, i.default);
}
function p(e, r) {
	let i = {}, a = {};
	for (let [o, s] of Object.entries(e.settings)) {
		let e = n(o, s);
		if (!e) continue;
		let c = (e, t) => {
			e === void 0 || o in i || (i[o] = e, a[o] = t);
		};
		t(s) ? (c(l(e, s.fixed), "fixed"), c(l(e, r.app?.[o]), "app"), c(l(e, s.default), "own"), c(l(e, r.family?.[o]), "family"), c(l(e, e.default), "built-in")) : (c(l(e, r.app?.[o]), "app"), c(f(o, s), "built-in"));
	}
	return {
		values: i,
		sources: a
	};
}
var m = /^[a-zA-Z][\w.-]{0,63}$/, h = /^[a-z0-9][a-z0-9-]{0,39}$/, g = (e) => typeof e == "string" || i(e) && typeof e.en == "string" && (e.de === void 0 || typeof e.de == "string");
function _(e, t, n) {
	let r = (e) => (t.push(`${n}: ${e}`), !1);
	if (!Array.isArray(e) || !e.length || e.length > 500) return r("ids must be a list of 1 to 500");
	let a = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!i(t) || typeof t.id != "string" || !t.id || a.has(t.id)) return r("every id needs a unique \"id\"");
		if (t.label !== void 0 && !g(t.label) || t.hint !== void 0 && !g(t.hint)) return r(`${t.id}'s label or hint isn't text`);
		a.add(t.id);
	}
	return !0;
}
function v(n, r, s) {
	let c = (e) => void s.push(`${n}: ${e}`);
	if (!i(r)) return c("not an object");
	for (let e of [
		"label",
		"help",
		"group"
	]) if (r[e] !== void 0 && !g(r[e])) return c(`${e} must be text`);
	if (r.family === !0) {
		let t = e[n];
		return t ? r.default !== void 0 && l(t, r.default) === void 0 ? c("its default isn’t one of the family’s values") : r.fixed !== void 0 && l(t, r.fixed) === void 0 ? c("its fixed value isn’t one of the family’s values") : r : c(`the family has no setting "${n}"`);
	}
	let u = r;
	switch (u.type) {
		case "bool":
		case "text": break;
		case "enum":
			if (!Array.isArray(u.options) || !u.options.length || !u.options.every((e) => typeof e == "string" || typeof e == "number")) return c("options must be strings or numbers");
			if (u.labels !== void 0 && (!i(u.labels) || !Object.values(u.labels).every(g))) return c("labels must be text");
			break;
		case "int":
		case "number":
			for (let e of [
				"min",
				"max",
				"step"
			]) if (u[e] !== void 0 && typeof u[e] != "number") return c(`${e} must be a number`);
			break;
		case "order": return _(u.ids, s, n) ? u.default !== void 0 && o(u.default, a(u), a(u))?.join() !== u.default.join() ? c("its default must name each id once") : u : void 0;
		case "pick":
			if (!_(u.ids, s, n)) return;
			if (!Number.isInteger(u.n) || u.n < 1 || u.n > u.ids.length) return c("n must be between 1 and the number of ids");
			if (u.from !== void 0 && (!Array.isArray(u.from) || !u.from.every((e) => typeof e == "string"))) return c("from must name settings");
			break;
		case "items":
			if (!_(u.ids, s, n)) return;
			if (!i(u.fields) || !Object.keys(u.fields).length) return c("items need fields");
			for (let [e, r] of Object.entries(u.fields)) {
				if (e === "id" || !m.test(e)) return c(`field "${e}" can’t be used`);
				let i = v(`${n}.${e}`, r, s);
				if (!i || t(i) || ![
					"bool",
					"enum",
					"int",
					"number"
				].includes(i.type)) return c(`field "${e}" must be bool, enum, int or number`);
			}
			return u.default !== void 0 && !Array.isArray(u.default) ? c("its default must be a list") : u;
		case "layout": {
			if (!i(u.grids) || !Object.keys(u.grids).length) return c("a layout needs grids");
			for (let [e, t] of Object.entries(u.grids)) if (e === "narrow" || !i(t) || !Number.isInteger(t.columns) || t.columns < 1 || t.columns > 48) return c(`grid "${e}" needs 1 to 48 columns`);
			if (!_(u.groups, s, `${n}.groups`) || !_(u.tiles, s, `${n}.tiles`)) return;
			let e = a({ ids: u.groups });
			for (let t of u.tiles) {
				if (!e.includes(t.group)) return c(`tile "${t.id}" is in no group`);
				if (t.min !== void 0 && (!Array.isArray(t.min) || t.min.length !== 2 || !t.min.every((e) => Number.isInteger(e) && e >= 1))) return c(`tile "${t.id}" has a bad smallest size`);
			}
			if (u.heights !== void 0 && (!Array.isArray(u.heights) || !u.heights.every((e) => Number.isInteger(e) && e > 0))) return c("heights must be whole pixels");
			break;
		}
		default: return c(`unknown type "${String(u.type)}"`);
	}
	return l(u, u.default) === void 0 ? c("its default doesn’t fit its own type") : u;
}
function y(e) {
	let n = [], r = {
		app: "",
		version: 0,
		settings: {}
	};
	if (!i(e)) return {
		ok: !1,
		manifest: r,
		problems: ["not a JSON object"]
	};
	if ((typeof e.app != "string" || !h.test(e.app)) && n.push("app must be the app’s slug"), (!Number.isInteger(e.version) || e.version < 1) && n.push("version must be a whole number from 1"), i(e.settings) || n.push("settings must be an object"), n.length) return {
		ok: !1,
		manifest: r,
		problems: n
	};
	let a = {}, o = Object.entries(e.settings);
	o.length > 100 && n.push(`only the first 100 of ${o.length} settings are used`);
	for (let [e, t] of o.slice(0, 100)) {
		if (!m.test(e)) {
			n.push(`${e}: not a usable key`);
			continue;
		}
		let r = v(e, t, n);
		r && (a[e] = r);
	}
	for (let [e, r] of Object.entries(a)) if (!t(r) && r.type === "pick" && r.from) {
		let i = r.from.filter((e) => {
			let n = a[e];
			return !n || t(n) || n.type !== "order" || n.ids.some((e) => !r.ids.some((t) => t.id === e.id));
		});
		i.length && (n.push(`${e}: from names ${i.join(", ")}, which aren’t order settings over its ids`), delete r.from);
	}
	return {
		ok: !0,
		manifest: {
			app: e.app,
			version: e.version,
			settings: a
		},
		problems: n
	};
}
//#endregion
export { e as FAMILY, f as builtIn, l as check, y as checkManifest, t as isFamilyRef, d as layoutBase, p as resolve, n as specOf, r as text };
