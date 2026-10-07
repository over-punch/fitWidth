// Measurements behind the talk and paper "Width, Font Size, Tracking": generated from the kit's research outputs (chrome-measure.json, gf-metadata.json) on 2026-10-07. Do not edit by hand.

/** One measured family: its name, its own wdth range, whether it has an optical-size axis, and the reach of wdth 75–125 (clamped) as a share of the width at wdth 100, in Chromium 149 and in HarfBuzz. */
export interface MeasuredFamily {
	name: string
	wdth: [number, number]
	opsz: boolean
	chrome: [number, number]
	harfbuzz: [number, number]
}

/** The 21 measured families, sorted by span (narrowest first). Mean of five strings at 72 px, weight 400. */
export const FAMILIES: MeasuredFamily[] = [
	{ name: 'IBM Plex Sans', wdth: [75, 100], opsz: false, chrome: [0.903, 1.000], harfbuzz: [0.903, 1.000] },
	{ name: 'Advent Pro', wdth: [100, 200], opsz: false, chrome: [1.000, 1.101], harfbuzz: [1.000, 1.101] },
	{ name: 'Roboto', wdth: [75, 100], opsz: false, chrome: [0.882, 1.000], harfbuzz: [0.882, 1.000] },
	{ name: 'Merriweather', wdth: [87, 112], opsz: true, chrome: [0.901, 1.047], harfbuzz: [0.900, 1.047] },
	{ name: 'Noto Sans', wdth: [62.5, 100], opsz: false, chrome: [0.824, 1.000], harfbuzz: [0.824, 1.000] },
	{ name: 'Roboto Serif', wdth: [50, 150], opsz: true, chrome: [0.878, 1.084], harfbuzz: [0.878, 1.084] },
	{ name: 'Open Sans', wdth: [75, 100], opsz: false, chrome: [0.742, 1.000], harfbuzz: [0.742, 1.000] },
	{ name: 'Encode Sans', wdth: [75, 125], opsz: false, chrome: [0.869, 1.131], harfbuzz: [0.869, 1.131] },
	{ name: 'Bricolage Grotesque', wdth: [75, 100], opsz: true, chrome: [0.683, 1.000], harfbuzz: [0.684, 1.000] },
	{ name: 'League Gothic', wdth: [75, 100], opsz: false, chrome: [0.683, 1.000], harfbuzz: [0.683, 1.000] },
	{ name: 'Roboto Flex', wdth: [25, 151], opsz: true, chrome: [0.831, 1.195], harfbuzz: [0.831, 1.195] },
	{ name: 'Asap', wdth: [75, 125], opsz: false, chrome: [0.819, 1.191], harfbuzz: [0.819, 1.191] },
	{ name: 'Science Gothic', wdth: [50, 200], opsz: false, chrome: [0.769, 1.141], harfbuzz: [0.769, 1.141] },
	{ name: 'Nunito Sans', wdth: [75, 125], opsz: true, chrome: [0.837, 1.232], harfbuzz: [0.838, 1.232] },
	{ name: 'Inconsolata', wdth: [50, 200], opsz: false, chrome: [0.800, 1.200], harfbuzz: [0.800, 1.200] },
	{ name: 'Saira', wdth: [50, 125], opsz: false, chrome: [0.746, 1.150], harfbuzz: [0.746, 1.150] },
	{ name: 'Mona Sans', wdth: [75, 125], opsz: false, chrome: [0.634, 1.072], harfbuzz: [0.634, 1.072] },
	{ name: 'Archivo', wdth: [62, 125], opsz: false, chrome: [0.793, 1.271], harfbuzz: [0.792, 1.271] },
	{ name: 'Anybody', wdth: [50, 150], opsz: false, chrome: [0.684, 1.316], harfbuzz: [0.684, 1.316] },
	{ name: 'Georama', wdth: [62.5, 150], opsz: false, chrome: [0.667, 1.333], harfbuzz: [0.667, 1.333] },
	{ name: 'Anek Latin', wdth: [75, 125], opsz: false, chrome: [0.660, 1.337], harfbuzz: [0.659, 1.336] },
]

/** Median narrowest and median widest reach across the 21 families (two separate medians). */
export const MEDIAN_REACH: [number, number] = [0.800, 1.131]

/** One row of the library sweep: a target (multiple of natural width) and how many of the 21 fonts fit under each strategy. */
export interface GridRow {
	ratio: number
	axis: number
	tracking: number
	auto: number
	size: number
}

/** The library sweep: "Headline fitting" at 72 px in each of the 21 fonts, 16 targets from 0.5× to 2× natural width. */
export const GRID: GridRow[] = [
	{ ratio: 0.5, axis: 0, tracking: 21, auto: 21, size: 21 },
	{ ratio: 0.6, axis: 0, tracking: 21, auto: 21, size: 21 },
	{ ratio: 0.7, axis: 5, tracking: 21, auto: 21, size: 21 },
	{ ratio: 0.8, axis: 11, tracking: 21, auto: 21, size: 21 },
	{ ratio: 0.9, axis: 18, tracking: 21, auto: 21, size: 21 },
	{ ratio: 1, axis: 21, tracking: 21, auto: 21, size: 21 },
	{ ratio: 1.1, axis: 11, tracking: 21, auto: 20, size: 21 },
	{ ratio: 1.2, axis: 6, tracking: 21, auto: 21, size: 21 },
	{ ratio: 1.3, axis: 3, tracking: 21, auto: 21, size: 21 },
	{ ratio: 1.4, axis: 0, tracking: 21, auto: 21, size: 21 },
	{ ratio: 1.5, axis: 0, tracking: 21, auto: 21, size: 21 },
	{ ratio: 1.6, axis: 0, tracking: 19, auto: 21, size: 21 },
	{ ratio: 1.7, axis: 0, tracking: 4, auto: 13, size: 21 },
	{ ratio: 1.8, axis: 0, tracking: 3, auto: 10, size: 21 },
	{ ratio: 1.9, axis: 0, tracking: 2, auto: 7, size: 21 },
	{ ratio: 2, axis: 0, tracking: 1, auto: 5, size: 21 },
]

/** Totals over the 336 cases of GRID, per strategy. */
export const GRID_TOTAL = { cases: 336, axis: 75, tracking: 260, auto: 286, size: 336 }

/** Roboto Flex in Chromium 149: reach of wdth 75 and 125 at each font size (optical size automatic), as a share of the width at wdth 100. [px, wdth 75, wdth 125]. */
export const OPSZ: [number, number, number][] = [
	[14, 0.964, 1.062],
	[24, 0.933, 1.094],
	[36, 0.891, 1.135],
	[48, 0.872, 1.154],
	[72, 0.831, 1.195],
	[96, 0.806, 1.22],
	[144, 0.797, 1.229],
]

/** Google Fonts census (fonts.google.com/metadata/fonts, fetched 2026-10-07 10:44 UTC). */
export const CENSUS = { families: 1950, variable: 561, wdth: 97, maxAt100: 49, notoMaxAt100: 37, minAt100: 8, cover75to125: 37, exactly75to125: 24, medianSpan: 37.5 }

/** Every Google Fonts family with a wdth axis: [family, min, max], sorted by span. */
export const WDTH_FAMILIES: [string, number, number][] = [
	["BioRhyme", 100, 125],
	["Bricolage Grotesque", 75, 100],
	["Cabin", 75, 100],
	["DynaPuff", 75, 100],
	["IBM Plex Sans", 75, 100],
	["Instrument Sans", 75, 100],
	["Kalnia", 100, 125],
	["Kalnia Glaze", 100, 125],
	["League Gothic", 75, 100],
	["M PLUS Code Latin", 100, 125],
	["Merriweather", 87, 112],
	["Open Sans", 75, 100],
	["Pathway Extreme", 75, 100],
	["Playfair", 87.5, 112.5],
	["Pliant", 100, 125],
	["Radio Canada", 75, 100],
	["Roboto", 75, 100],
	["Sour Gummy", 100, 125],
	["Tektur", 75, 100],
	["Ubuntu Sans", 75, 100],
	["Martian Mono", 75, 112.5],
	["Noto Sans", 62.5, 100],
	["Noto Sans Arabic", 62.5, 100],
	["Noto Sans Armenian", 62.5, 100],
	["Noto Sans Bengali", 62.5, 100],
	["Noto Sans Devanagari", 62.5, 100],
	["Noto Sans Display", 62.5, 100],
	["Noto Sans Ethiopic", 62.5, 100],
	["Noto Sans Georgian", 62.5, 100],
	["Noto Sans Gujarati", 62.5, 100],
	["Noto Sans Gurmukhi", 62.5, 100],
	["Noto Sans Hebrew", 62.5, 100],
	["Noto Sans Kannada", 62.5, 100],
	["Noto Sans Khmer", 62.5, 100],
	["Noto Sans Lao", 62.5, 100],
	["Noto Sans Lao Looped", 62.5, 100],
	["Noto Sans Malayalam", 62.5, 100],
	["Noto Sans Mono", 62.5, 100],
	["Noto Sans Myanmar", 62.5, 100],
	["Noto Sans Oriya", 62.5, 100],
	["Noto Sans Sinhala", 62.5, 100],
	["Noto Sans Tamil", 62.5, 100],
	["Noto Sans Telugu", 62.5, 100],
	["Noto Sans Thai", 62.5, 100],
	["Noto Sans Thai Looped", 62.5, 100],
	["Noto Serif", 62.5, 100],
	["Noto Serif Armenian", 62.5, 100],
	["Noto Serif Bengali", 62.5, 100],
	["Noto Serif Devanagari", 62.5, 100],
	["Noto Serif Display", 62.5, 100],
	["Noto Serif Ethiopic", 62.5, 100],
	["Noto Serif Georgian", 62.5, 100],
	["Noto Serif Hebrew", 62.5, 100],
	["Noto Serif Khmer", 62.5, 100],
	["Noto Serif Lao", 62.5, 100],
	["Noto Serif Sinhala", 62.5, 100],
	["Noto Serif Tamil", 62.5, 100],
	["Noto Serif Thai", 62.5, 100],
	["Anek Bangla", 75, 125],
	["Anek Devanagari", 75, 125],
	["Anek Gujarati", 75, 125],
	["Anek Gurmukhi", 75, 125],
	["Anek Kannada", 75, 125],
	["Anek Latin", 75, 125],
	["Anek Malayalam", 75, 125],
	["Anek Odia", 75, 125],
	["Anek Tamil", 75, 125],
	["Anek Telugu", 75, 125],
	["Asap", 75, 125],
	["Asap Sharp", 75, 125],
	["Encode Sans", 75, 125],
	["Encode Sans SC", 75, 125],
	["Fredoka", 75, 125],
	["Hubot Sans", 75, 125],
	["Mona Sans", 75, 125],
	["Mozilla Headline", 75, 125],
	["Nunito Sans", 75, 125],
	["Special Gothic", 75, 125],
	["Tourney", 75, 125],
	["Trispace", 75, 125],
	["Truculenta", 75, 125],
	["Zalando Sans", 75, 125],
	["Archivo", 62, 125],
	["Saira", 50, 125],
	["Saira Stencil", 50, 125],
	["TikTok Sans", 75, 150],
	["Georama", 62.5, 150],
	["Advent Pro", 100, 200],
	["Anybody", 50, 150],
	["Datatype", 50, 150],
	["Roboto Serif", 50, 150],
	["Strichpunkt Sans", 100, 200],
	["Google Sans Flex", 25, 151],
	["Roboto Flex", 25, 151],
	["Inconsolata", 50, 200],
	["Science Gothic", 50, 200],
	["Linefont", 25, 200],
]
