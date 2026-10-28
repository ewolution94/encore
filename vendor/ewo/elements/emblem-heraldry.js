//#region packages/elements/src/emblem-heraldry.ts
var e = [
	[{
		de: "Mond",
		en: "Crescent"
	}, "M62 22A30 30 0 1 0 62 78A24 24 0 1 1 62 22Z"],
	[{
		de: "Stern",
		en: "Star"
	}, "M50 18L58 41L82 41L63 55L70 79L50 64L30 79L37 55L18 41L42 41Z"],
	[{
		de: "Turm",
		en: "Tower"
	}, "M30 80V38H36V30H44V38H48V30H56V38H60V30H68V38H70V80H57V62A7 7 0 0 0 43 62V80Z"],
	[{
		de: "Schlüssel",
		en: "Key"
	}, "M34 30A12 12 0 1 1 34 54A12 12 0 1 1 34 30ZM34 37A5 5 0 1 0 34 47A5 5 0 1 0 34 37ZM44 39H80V45H74V53H68V45H62V51H56V45H44Z"],
	[{
		de: "Krone",
		en: "Crown"
	}, "M24 70L20 34L36 50L50 26L64 50L80 34L76 70Z"],
	[{
		de: "Fisch",
		en: "Fish"
	}, "M18 50C30 32 56 30 70 46L84 34V66L70 54C56 70 30 68 18 50ZM32 46A3 3 0 1 0 32 52A3 3 0 1 0 32 46Z"],
	[{
		de: "Vogel",
		en: "Bird"
	}, "M20 56C32 50 40 38 52 38C60 38 64 42 68 46L82 44L72 52C70 64 58 72 44 72C34 72 26 66 20 56ZM58 44A3 3 0 1 0 58 50A3 3 0 1 0 58 44Z"],
	[{
		de: "Baum",
		en: "Tree"
	}, "M46 84V64C32 64 22 54 24 42C26 30 36 24 44 26C46 18 58 16 64 24C74 24 80 34 76 44C80 56 68 66 54 64V84Z"],
	[{
		de: "Schwert",
		en: "Sword"
	}, "M47 16H53V60H66V66H53V76H57V84H43V76H47V66H34V60H47Z"],
	[{
		de: "Kelch",
		en: "Chalice"
	}, "M28 22H72C72 44 62 54 54 56V70H64V78H36V70H46V56C38 54 28 44 28 22Z"],
	[{
		de: "Rad",
		en: "Wheel"
	}, "M50 20A30 30 0 1 1 50 80A30 30 0 1 1 50 20ZM50 30A20 20 0 1 0 50 70A20 20 0 1 0 50 30ZM47 30H53V70H47ZM30 47H70V53H30Z"],
	[{
		de: "Glocke",
		en: "Bell"
	}, "M50 18C56 18 58 22 58 26C68 30 72 42 72 56C72 64 78 68 82 72H18C22 68 28 64 28 56C28 42 32 30 42 26C42 22 44 18 50 18ZM44 76H56A6 6 0 0 1 44 76Z"],
	[{
		de: "Hufeisen",
		en: "Horseshoe"
	}, "M28 26H40V54A10 10 0 0 0 60 54V26H72V54A22 22 0 0 1 28 54Z"],
	[{
		de: "Axt",
		en: "Axe"
	}, "M46 16H52V84H46ZM52 22C66 22 78 32 80 46C72 42 62 44 52 48Z"],
	[{
		de: "Pilz",
		en: "Mushroom"
	}, "M18 52C18 32 34 22 50 22C66 22 82 32 82 52ZM42 52H58L62 80H38Z"],
	[{
		de: "Rose",
		en: "Rose"
	}, "M50 20C58 20 62 28 60 36C68 32 78 38 76 46C82 52 78 62 70 62C72 70 64 78 56 74C52 82 40 82 38 74C30 78 22 70 26 62C18 62 14 52 20 46C18 38 28 32 36 36C34 28 42 20 50 20ZM50 42A8 8 0 1 0 50 58A8 8 0 1 0 50 42Z"],
	[{
		de: "Anker",
		en: "Anchor"
	}, "M50 15A7.5 7.5 0 1 1 50 30A7.5 7.5 0 1 1 50 15ZM50 20A2.5 2.5 0 1 0 50 25A2.5 2.5 0 1 0 50 20ZM47 30H53V40H64V46H53V74C60 73 67 68 71 60L65 58L80 50L82 66L77 63C71 74 61 80 50 80C39 80 29 74 23 63L18 66L20 50L35 58L29 60C33 68 40 73 47 74V46H36V40H47Z"],
	[{
		de: "Herz",
		en: "Heart"
	}, "M50 82C36 70 18 58 18 40C18 28 27 20 37 20C43 20 47 23 50 28C53 23 57 20 63 20C73 20 82 28 82 40C82 58 64 70 50 82Z"],
	[{
		de: "Sonne",
		en: "Sun"
	}, "M50 16L58.4 29.7L74 26L70.3 41.6L84 50L70.3 58.4L74 74L58.4 70.3L50 84L41.6 70.3L26 74L29.7 58.4L16 50L29.7 41.6L26 26L41.6 29.7Z"],
	[{
		de: "Blatt",
		en: "Leaf"
	}, "M20 82L29 73C25 47 45 26 80 20C77 55 57 74 33 76L24 85Z"],
	[{
		de: "Blitz",
		en: "Lightning"
	}, "M58 14L28 54H46L38 86L74 42H54L64 14Z"],
	[{
		de: "Würfel",
		en: "Die"
	}, "M26 22H74A4 4 0 0 1 78 26V74A4 4 0 0 1 74 78H26A4 4 0 0 1 22 74V26A4 4 0 0 1 26 22ZM34 29A5 5 0 1 0 34 39A5 5 0 1 0 34 29ZM66 29A5 5 0 1 0 66 39A5 5 0 1 0 66 29ZM50 45A5 5 0 1 0 50 55A5 5 0 1 0 50 45ZM34 61A5 5 0 1 0 34 71A5 5 0 1 0 34 61ZM66 61A5 5 0 1 0 66 71A5 5 0 1 0 66 61Z"],
	[{
		de: "Eichel",
		en: "Acorn"
	}, "M48 16H52V28C61 28.5 70 35 70 46H30C30 35 39 28.5 48 28ZM36 49H64C64 67 58 79 50 84C42 79 36 67 36 49Z"],
	[{
		de: "Pik",
		en: "Spade"
	}, "M50 16C56 30 82 40 82 58C82 70 72 76 63 74C58 73 55 70 53 67C54 74 57 80 62 84H38C43 80 46 74 47 67C45 70 42 73 37 74C28 76 18 70 18 58C18 40 44 30 50 16Z"]
], t = "M8 6H92V44C92 72 72 88 50 96C28 88 8 72 8 44Z", n = [
	0,
	1,
	2,
	3
].flatMap((e) => [
	0,
	1,
	2,
	3
].filter((t) => (e + t) % 2 == 0).map((t) => `M${t * 25} ${e * 25}h25v25h-25Z`)).join(""), r = "M0 30Q12.5 22 25 30T50 30T75 30T100 30V40Q87.5 48 75 40T50 40T25 40T0 40ZM0 58Q12.5 50 25 58T50 58T75 58T100 58V68Q87.5 76 75 68T50 68T25 68T0 68Z", i = [
	20,
	40,
	60,
	80
].flatMap((e) => [
	20,
	40,
	60,
	80
].map((t) => `M${e - 5} ${t}a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z`)).join(""), a = "<path d=\"M20 18L80 82M80 18L20 82\" class=\"strike\"/>", o = e.map(([e]) => e), s = [
	[{
		de: "Tinte",
		en: "Ink"
	}, "<rect width=\"100\" height=\"100\" class=\"e1\"/>"],
	[{
		de: "Farbe",
		en: "Colour"
	}, "<rect width=\"100\" height=\"100\" class=\"e2\"/>"],
	[{
		de: "Gespalten",
		en: "Per pale"
	}, "<rect width=\"100\" height=\"100\" class=\"e3\"/><rect width=\"50\" height=\"100\" class=\"e1\"/>"],
	[{
		de: "Geteilt",
		en: "Per fess"
	}, "<rect width=\"100\" height=\"100\" class=\"e1\"/><rect width=\"100\" height=\"48\" class=\"e2\"/>"],
	[{
		de: "Schräg geteilt",
		en: "Per bend"
	}, "<rect width=\"100\" height=\"100\" class=\"e2\"/><path d=\"M0 0H100L0 100Z\" class=\"e1\"/>"],
	[{
		de: "Geviert",
		en: "Quarterly"
	}, "<rect width=\"100\" height=\"100\" class=\"e3\"/><path d=\"M0 0H50V50H100V100H50V50H0Z\" class=\"e1\"/>"],
	[{
		de: "Bord",
		en: "Bordure"
	}, "<rect width=\"100\" height=\"100\" class=\"e1\"/><path d=\"M18 16H82V44C82 64 68 76 50 84C32 76 18 64 18 44Z\" class=\"e3\"/>"],
	[{
		de: "Berg",
		en: "Mount"
	}, "<rect width=\"100\" height=\"100\" class=\"e1\"/><path d=\"M0 74L50 34L100 74V100H0Z\" class=\"e2\"/>"],
	[{
		de: "Sparren",
		en: "Chevron"
	}, "<rect width=\"100\" height=\"100\" class=\"e3\"/><path d=\"M0 74L50 40L100 74V94L50 60L0 94Z\" class=\"e1\"/>"],
	[{
		de: "Andreaskreuz",
		en: "Saltire"
	}, "<rect width=\"100\" height=\"100\" class=\"e2\"/><path d=\"M0 0H14L50 36L86 0H100V14L64 50L100 86V100H86L50 64L14 100H0V86L36 50L0 14Z\" class=\"e1\"/>"],
	[{
		de: "Kreuz",
		en: "Cross"
	}, "<rect width=\"100\" height=\"100\" class=\"e1\"/><path d=\"M40 0H60V40H100V60H60V100H40V60H0V40H40Z\" class=\"e3\"/>"],
	[{
		de: "Geschacht",
		en: "Chequy"
	}, `<rect width="100" height="100" class="e3"/><path d="${n}" class="e1"/>`],
	[{
		de: "Wellen",
		en: "Waves"
	}, `<rect width="100" height="100" class="e1"/><path d="${r}" class="e2"/>`],
	[{
		de: "Pfahl",
		en: "Pale"
	}, "<rect width=\"100\" height=\"100\" class=\"e1\"/><rect x=\"34\" width=\"32\" height=\"100\" class=\"e3\"/>"]
], c = {
	id: "heraldry",
	parts: [{
		name: {
			de: "Feld",
			en: "Field"
		},
		options: s.map(([e]) => e)
	}, {
		name: {
			de: "Figur",
			en: "Charge"
		},
		options: o
	}],
	svg([n, r], { uid: i = "e", dead: o = !1 } = {}) {
		return `<svg viewBox="0 0 100 100" class="heraldry" aria-hidden="true"><defs><clipPath id="s${i}"><path d="${t}"/></clipPath></defs><g${o ? " class=\"faded\"" : ""}><g clip-path="url(#s${i})">${s[n]?.[1] ?? s[0][1]}<path class="charge" d="${e[r]?.[1] ?? e[0][1]}" transform="translate(50 52) scale(0.62) translate(-50 -50)"/></g><path d="${t}" class="rim"/></g>${o ? a : ""}</svg>`;
	},
	fromSeed: (e) => [(e >>> 7) % 8, e % 16]
}, l = [
	[
		{
			de: "Indigo & Gold",
			en: "Indigo & gold"
		},
		"#232a6e",
		"#ffd23f"
	],
	[
		{
			de: "Karmin & Rosé",
			en: "Crimson & blush"
		},
		"#a3123f",
		"#ffd6e2"
	],
	[
		{
			de: "Tanne & Minze",
			en: "Pine & mint"
		},
		"#0f5246",
		"#b5ecd3"
	],
	[
		{
			de: "Blau & Eis",
			en: "Blue & ice"
		},
		"#2148b8",
		"#d6e4ff"
	],
	[
		{
			de: "Violett & Flieder",
			en: "Violet & lilac"
		},
		"#5b2a9e",
		"#e7d9ff"
	],
	[
		{
			de: "Rot & Creme",
			en: "Red & cream"
		},
		"#c8351f",
		"#fff0d1"
	],
	[
		{
			de: "Tinte & Papier",
			en: "Ink & paper"
		},
		"#1b1b1f",
		"#ecebe6"
	],
	[
		{
			de: "Bernstein & Butter",
			en: "Amber & butter"
		},
		"#9a4f00",
		"#ffeaa8"
	],
	[
		{
			de: "Petrol & Sand",
			en: "Petrol & sand"
		},
		"#0b4f5c",
		"#f3dfb5"
	],
	[
		{
			de: "Pflaume & Pfirsich",
			en: "Plum & peach"
		},
		"#5e1f4f",
		"#ffd3b8"
	],
	[
		{
			de: "Wald & Limette",
			en: "Forest & lime"
		},
		"#23471a",
		"#d9f2a0"
	],
	[
		{
			de: "Marine & Koralle",
			en: "Navy & coral"
		},
		"#13294b",
		"#ff9e8a"
	],
	[
		{
			de: "Schoko & Karamell",
			en: "Cocoa & caramel"
		},
		"#4a2817",
		"#f1c48d"
	],
	[
		{
			de: "Schiefer & Himmel",
			en: "Slate & sky"
		},
		"#2f3e4e",
		"#bfe3ff"
	]
], u = [
	[{
		de: "Dunkel",
		en: "Dark"
	}, (e) => `<rect width="100" height="100" fill="${e}"/>`],
	[{
		de: "Hell",
		en: "Light"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><circle cx="50" cy="50" r="40" fill="none" stroke="${e}" stroke-width="2.5"/>`],
	[{
		de: "Gespalten",
		en: "Per pale"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><rect width="50" height="100" fill="${e}"/>`],
	[{
		de: "Geteilt",
		en: "Per fess"
	}, (e, t) => `<rect width="100" height="100" fill="${e}"/><rect width="100" height="50" fill="${t}"/>`],
	[{
		de: "Schräg geteilt",
		en: "Per bend"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><path d="M0 0H100L0 100Z" fill="${e}"/>`],
	[{
		de: "Geviert",
		en: "Quarterly"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><path d="M0 0H50V50H100V100H50V50H0Z" fill="${e}"/>`],
	[{
		de: "Ring",
		en: "Annulet"
	}, (e, t) => `<rect width="100" height="100" fill="${e}"/><circle cx="50" cy="50" r="34" fill="${t}"/>`],
	[{
		de: "Streifen",
		en: "Bars"
	}, (e, t) => `<rect width="100" height="100" fill="${e}"/><path d="M0 22H100V34H0ZM0 44H100V56H0ZM0 66H100V78H0Z" fill="${t}"/>`],
	[{
		de: "Sparren",
		en: "Chevron"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><path d="M0 72L50 36L100 72V92L50 56L0 92Z" fill="${e}"/>`],
	[{
		de: "Andreaskreuz",
		en: "Saltire"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><path d="M0 0H14L50 36L86 0H100V14L64 50L100 86V100H86L50 64L14 100H0V86L36 50L0 14Z" fill="${e}"/>`],
	[{
		de: "Kreuz",
		en: "Cross"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><path d="M40 0H60V40H100V60H60V100H40V60H0V40H40Z" fill="${e}"/>`],
	[{
		de: "Geschacht",
		en: "Chequy"
	}, (e, t) => `<rect width="100" height="100" fill="${t}"/><path d="${n}" fill="${e}"/>`],
	[{
		de: "Wellen",
		en: "Waves"
	}, (e, t) => `<rect width="100" height="100" fill="${e}"/><path d="${r}" fill="${t}"/>`],
	[{
		de: "Punkte",
		en: "Dots"
	}, (e, t) => `<rect width="100" height="100" fill="${e}"/><path d="${i}" fill="${t}"/>`]
], d = {
	id: "token",
	parts: [
		{
			name: {
				de: "Farben",
				en: "Colours"
			},
			options: l.map(([e]) => e)
		},
		{
			name: {
				de: "Teilung",
				en: "Division"
			},
			options: u.map(([e]) => e)
		},
		{
			name: {
				de: "Figur",
				en: "Charge"
			},
			options: o
		}
	],
	svg([t, n, r], { uid: i = "e", dead: o = !1 } = {}) {
		let [, s, c] = l[t] ?? l[0], d = (u[n] ?? u[0])[1](s, c);
		return `<svg viewBox="0 0 100 100" class="token" aria-hidden="true"><defs><clipPath id="r${i}"><circle cx="50" cy="50" r="46"/></clipPath></defs><g${o ? " class=\"faded\"" : ""}><g clip-path="url(#r${i})">${d}<path d="${e[r]?.[1] ?? e[0][1]}" transform="translate(50 50) scale(0.6) translate(-50 -50)" fill="#fffdf6" stroke="${s}" stroke-width="5" stroke-linejoin="round" paint-order="stroke"/></g><circle cx="50" cy="50" r="46" fill="none" stroke="${s}" stroke-width="4"/></g>${o ? a : ""}</svg>`;
	},
	fromSeed: (e) => [
		(e >>> 4) % 8,
		(e >>> 7) % 8,
		e % 16
	]
};
//#endregion
export { e as CHARGES, n as CHEQUY, r as WAVES, c as heraldry, d as token };
