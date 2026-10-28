import { CHARGES as e, WAVES as t } from "./emblem-heraldry.js";
//#region packages/elements/src/emblem-tag.ts
var n = "M34 14H84a8 8 0 0 1 8 8V78a8 8 0 0 1-8 8H34L11 54Q8 50 11 46Z", r = Array.from({ length: 8 }, (e, t) => Array.from({ length: 8 }, (e, n) => (t + n) % 2 ? "" : `M${n * 12.5} ${t * 12.5}h12.5v12.5h-12.5Z`).join("")).join(""), i = Array.from({ length: 7 }, (e, t) => {
	let n = (t + 1) * 12.5 - 1.25;
	return `M${n} 0h2.5v100h-2.5ZM0 ${n}h100v2.5h-100Z`;
}).join(""), a = [
	[
		{
			de: "Tasche",
			en: "Bag"
		},
		"M24 38H76L71 84H29Z",
		"M38 44V32A12 12 0 0 1 62 32V44"
	],
	[
		{
			de: "Geschenk",
			en: "Gift"
		},
		"M20 38H80V54H20ZM25 54H75V84H25Z",
		"M50 38V84M50 38C44 24 28 24 31 33C33 38 44 38 50 38C56 38 67 38 69 33C72 24 56 24 50 38"
	],
	[
		{
			de: "Edelstein",
			en: "Gem"
		},
		"M30 24H70L86 42L50 84L14 42Z",
		"M14 42H86M38 24L33 42L50 84L67 42L62 24"
	],
	[
		{
			de: "Münze",
			en: "Coin"
		},
		"M50 16A34 34 0 1 1 50 84A34 34 0 1 1 50 16Z",
		"M63 37A15 15 0 1 0 63 63M32 46H54M32 55H54"
	],
	[
		{
			de: "Einkaufswagen",
			en: "Cart"
		},
		"M28 32H84L76 62H36Z",
		"M12 22H25L38 70H78M37 80a5 5 0 1 0 10 0a5 5 0 1 0-10 0M67 80a5 5 0 1 0 10 0a5 5 0 1 0-10 0"
	],
	[{
		de: "Prozent",
		en: "Percent"
	}, "M32 20A11 11 0 1 1 32 42A11 11 0 1 1 32 20ZM68 58A11 11 0 1 1 68 80A11 11 0 1 1 68 58ZM70 16L80 24L30 84L20 76Z"]
], o = [
	[{
		de: "Mint",
		en: "Mint"
	}, "#64c8b9"],
	[{
		de: "Lila",
		en: "Purple"
	}, "#b198db"],
	[{
		de: "Orange",
		en: "Orange"
	}, "#f8a171"],
	[{
		de: "Blau",
		en: "Blue"
	}, "#6ea0eb"],
	[{
		de: "Rosa",
		en: "Pink"
	}, "#e89fdd"],
	[{
		de: "Grün",
		en: "Green"
	}, "#a9e034"],
	[{
		de: "Gelb",
		en: "Yellow"
	}, "#f5d547"],
	[{
		de: "Beige",
		en: "Beige"
	}, "#d8bda4"],
	[{
		de: "Petrol",
		en: "Teal"
	}, "#099f91"],
	[{
		de: "Pflaume",
		en: "Plum"
	}, "#9c7fcb"],
	[{
		de: "Koralle",
		en: "Coral"
	}, "#ff8a7a"],
	[{
		de: "Himmel",
		en: "Sky"
	}, "#8ecdf2"],
	[{
		de: "Salbei",
		en: "Sage"
	}, "#a9c7a1"],
	[{
		de: "Ocker",
		en: "Ochre"
	}, "#d9a441"]
], s = [
	[{
		de: "Schlicht",
		en: "Plain"
	}, ""],
	[{
		de: "Schräg",
		en: "Diagonal"
	}, "<path class=\"tp\" d=\"M0 0H100L0 100Z\"/>"],
	[{
		de: "Halbiert",
		en: "Halves"
	}, "<rect class=\"tp\" width=\"100\" height=\"50\"/>"],
	[{
		de: "Geviert",
		en: "Quarters"
	}, "<path class=\"tp\" d=\"M0 0H62V50H100V100H62V50H0Z\"/>"],
	[{
		de: "Rand",
		en: "Border"
	}, `<path class="tb" d="${n}"/>`],
	[{
		de: "Streifen",
		en: "Stripes"
	}, "<path class=\"tp\" d=\"M0 26H100V36H0ZM0 45H100V55H0ZM0 64H100V74H0Z\"/>"],
	[{
		de: "Punkte",
		en: "Dots"
	}, [
		44,
		62,
		80
	].flatMap((e) => [
		30,
		50,
		70
	].map((t) => `<circle class="tp" cx="${e}" cy="${t}" r="5.5"/>`)).join("")],
	[{
		de: "Sparren",
		en: "Chevron"
	}, "<path class=\"tp\" d=\"M0 76L62 46L100 64V100H0Z\"/>"],
	[{
		de: "Karo",
		en: "Checks"
	}, `<path class="tp" d="${r}"/>`],
	[{
		de: "Wellen",
		en: "Waves"
	}, `<path class="tp" d="${t}"/>`],
	[{
		de: "Zickzack",
		en: "Zigzag"
	}, "<path class=\"tp\" d=\"M0 44L12.5 34L25 44L37.5 34L50 44L62.5 34L75 44L87.5 34L100 44V56L87.5 46L75 56L62.5 46L50 56L37.5 46L25 56L12.5 46L0 56Z\"/>"],
	[{
		de: "Gitter",
		en: "Grid"
	}, `<path class="tp" d="${i}"/>`]
], c = [
	{
		de: "Anfangsbuchstabe",
		en: "Initial"
	},
	...a.map(([e]) => e),
	...e.map(([e]) => e)
], l = "translate(62 50) scale(0.54) translate(-50 -50)", u = (e) => e.replace(/[&<>"]/g, (e) => `&#${e.charCodeAt(0)};`), d = {
	id: "tag",
	parts: [
		{
			name: {
				de: "Farbe",
				en: "Colour"
			},
			options: o.map(([e]) => e)
		},
		{
			name: {
				de: "Muster",
				en: "Pattern"
			},
			options: s.map(([e]) => e)
		},
		{
			name: {
				de: "Figur",
				en: "Figure"
			},
			options: c
		}
	],
	svg([t, r, i], { uid: o = "e", dead: c = !1, initial: d = "" } = {}) {
		let f;
		if (!i) f = `<text class="ti" x="62" y="51" text-anchor="middle" dominant-baseline="central">${u([...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(d.trim())][0]?.segment.toUpperCase() ?? "?")}</text>`;
		else if (i <= a.length) {
			let [, e, t] = a[i - 1];
			f = `<g transform="${l}"><path class="tf" d="${e}"/>${t ? `<path class="tl" d="${t}"/>` : ""}</g>`;
		} else f = `<path class="tf" d="${e[i - 1 - a.length]?.[1] ?? e[0][1]}" transform="${l}"/>`;
		return `<svg viewBox="0 0 100 100" class="tag" aria-hidden="true"><g class="tc${t}${c ? " faded" : ""}" transform="rotate(-12 50 50) translate(50 50) scale(0.92) translate(-50 -50)"><defs><clipPath id="g${o}"><path d="${n}"/></clipPath></defs><g clip-path="url(#g${o})"><rect class="e1" width="100" height="100"/>${(s[r] ?? s[0])[1]}</g><path class="trim" d="${n}"/><circle class="thole" cx="24" cy="50" r="5.5"/>${f}</g>${c ? "<path d=\"M20 18L80 82M80 18L20 82\" class=\"strike\"/>" : ""}</svg>`;
	},
	fromSeed: (e) => [
		(e >>> 4) % o.length,
		(e >>> 7) % 8,
		1 + a.length + e % 16
	]
};
//#endregion
export { o as TAG_COLOURS, d as tag };
