import { resolve as e } from "./config-core.js";
//#region packages/elements/src/config-server.ts
var t = globalThis.process?.getBuiltinModule?.("node:fs"), n = class extends Error {};
function r({ manifest: r, url: i = "", dataFile: a = "", every: o = 15e3, timeout: s = 5e3, log: c = console.log }) {
	let l = r.app, u = null, d = {
		family: {},
		app: {}
	};
	if (a && t) try {
		({etag: u, raw: d} = JSON.parse(t.readFileSync(a, "utf8")));
	} catch {}
	let f = e(r, d), p = !1, m = !1, h = i ? "starting" : "off", g, _ = null, v = !1;
	async function y(e, t = {}) {
		let r = new AbortController(), a = (async () => {
			let n = await fetch(i + e, {
				...t,
				signal: r.signal
			}), a = n.status === 200 || n.status === 400 ? await n.text() : "";
			return {
				status: n.status,
				etag: n.headers.get("etag"),
				text: a
			};
		})();
		a.catch(() => {});
		let o, c = new Promise((t, r) => {
			o = setTimeout(() => r(new n(`${e}: no answer in ${s} ms`)), s);
		});
		try {
			return await Promise.race([a, c]);
		} catch (e) {
			throw r.abort(), e;
		} finally {
			clearTimeout(o);
		}
	}
	async function b() {
		if (!p && !m) {
			let e = await y(`/v1/manifest/${l}`, {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(r)
			});
			e.status < 300 ? p = !0 : e.status === 400 && (m = !0, c(`config: Dashboard refused the manifest: ${e.text.slice(0, 300)}`));
		}
		let n = await y(`/v1/config/${l}`, { headers: u ? { "if-none-match": u } : {} });
		if (n.status === 304) return "same";
		if (n.status !== 200) throw Error(`HTTP ${n.status}`);
		let i = JSON.parse(n.text);
		if (d = {
			family: i.family ?? {},
			app: i.app ?? {}
		}, u = n.etag, f = e(r, d), a && t) try {
			t.writeFileSync(`${a}.tmp`, JSON.stringify({
				etag: u,
				raw: d
			})), t.renameSync(`${a}.tmp`, a);
		} catch (e) {
			c(`config: can't keep the values in ${a} (${e.message})`);
		}
		return "new";
	}
	function x() {
		return _ ??= b().then((e) => {
			(h !== "ok" || e === "new") && c(e === "new" ? `config: new values ${u}` : "config: Dashboard reachable"), h = "ok";
		}).catch((e) => {
			h !== "down" && c(`config: keeping the last values (${e instanceof n ? e.message : e.cause?.code ?? e.message})`), h = "down";
		}).finally(() => {
			_ = null, !v && (g = setTimeout(x, o), g.unref?.());
		}), _;
	}
	return {
		start: () => i ? (v = !1, x()) : Promise.resolve(),
		stop: () => {
			v = !0, clearTimeout(g);
		},
		get: () => f,
		state: () => h,
		etag: () => u ?? "built-in",
		inject(e) {
			let t = JSON.stringify(f.values).replace(/</g, "\\u003c");
			return e.replace(/<head(\s[^>]*)?>/i, (e) => `${e}\n    <script type="application/json" id="ewo-config">${t}<\/script>`);
		}
	};
}
//#endregion
export { r as createConfig };
