import { EwoElement as e, css as t, define as n, onPageLanguage as r, pageLanguage as i } from "./base.js";
import "./segmented.js";
//#region packages/elements/src/settings-basics.ts
var a = {
	en: {
		language: "Language",
		theme: "Theme",
		system: "System",
		light: "Light",
		dark: "Dark"
	},
	de: {
		language: "Sprache",
		theme: "Design",
		system: "System",
		light: "Hell",
		dark: "Dunkel"
	}
}, o = (e) => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`, s = {
	languages: o("<path d=\"m5 8 6 6\"/><path d=\"m4 14 6-6 2-3\"/><path d=\"M2 5h12\"/><path d=\"M7 2h1\"/><path d=\"m22 22-5-10-5 10\"/><path d=\"M14 18h6\"/>"),
	monitor: o("<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>"),
	sun: o("<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>"),
	moon: o("<path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\"/>")
}, c = t`
  :host { display: flex; flex-direction: column; gap: 16px; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .name { font-size: 14px; color: var(--ewo-fg); }
  ewo-segmented { flex: none; width: min(300px, 62%); }
  /* Cantina's proportions: a little tighter, and a flat indicator. */
  ewo-segmented::part(option) { padding: 0 10px; }
  ewo-segmented::part(indicator) { box-shadow: none; }
  @media (max-width: 480px) {
    .row { flex-direction: column; align-items: stretch; gap: 10px; }
    ewo-segmented { width: 100%; }
  }
`, l = class extends e {
	static styles = [c];
	static observedAttributes = [
		"language",
		"theme",
		"language-label",
		"theme-label",
		"system-label",
		"light-label",
		"dark-label"
	];
	#e;
	#t;
	#n;
	#r;
	constructor() {
		super(), this.root.innerHTML = `
      <div class="row">
        <span class="name" id="language-name"></span>
        <ewo-segmented part="language">
          <span slot="icon-system">${s.languages}</span>
        </ewo-segmented>
      </div>
      <div class="row">
        <span class="name" id="theme-name"></span>
        <ewo-segmented part="theme">
          <span slot="icon-system">${s.monitor}</span>
          <span slot="icon-light">${s.sun}</span>
          <span slot="icon-dark">${s.moon}</span>
        </ewo-segmented>
      </div>`, this.#e = this.root.querySelector("[part=\"language\"]"), this.#t = this.root.querySelector("[part=\"theme\"]"), this.#n = this.root.querySelector("#language-name"), this.#r = this.root.querySelector("#theme-name");
		for (let e of [this.#e, this.#t]) e.toggleAttribute("stretch", !0);
		this.root.addEventListener("input", (e) => e.stopPropagation()), this.root.addEventListener("change", (e) => {
			e.stopPropagation();
			let { value: t } = e.detail;
			e.target === this.#e ? this.emit("language-change", { value: t }) : e.target === this.#t && this.emit("theme-change", { value: t });
		});
	}
	get language() {
		return this.getAttribute("language") || "system";
	}
	set language(e) {
		this.setAttribute("language", e);
	}
	get theme() {
		return this.getAttribute("theme") || "system";
	}
	set theme(e) {
		this.setAttribute("theme", e);
	}
	#i;
	connectedCallback() {
		this.#i = r(() => this.#a()), this.#a();
	}
	disconnectedCallback() {
		this.#i?.();
	}
	attributeChangedCallback() {
		this.#a();
	}
	#a() {
		let e = a[i()], t = (e, t) => this.getAttribute(e) || t, n = t("system-label", e.system), r = t("language-label", e.language), o = t("theme-label", e.theme);
		this.#n.textContent = r, this.#r.textContent = o, this.#e.setAttribute("label", r), this.#t.setAttribute("label", o);
		let s = [
			{
				value: "system",
				label: n
			},
			{
				value: "de",
				label: "Deutsch"
			},
			{
				value: "en",
				label: "English"
			}
		], c = [
			{
				value: "system",
				label: n
			},
			{
				value: "light",
				label: t("light-label", e.light)
			},
			{
				value: "dark",
				label: t("dark-label", e.dark)
			}
		];
		this.#e.options = s, this.#t.options = c, this.#e.value !== this.language && this.#e.setAttribute("value", this.language), this.#t.value !== this.theme && this.#t.setAttribute("value", this.theme);
	}
};
n("ewo-settings-basics", l);
//#endregion
export { l as EwoSettingsBasics };
