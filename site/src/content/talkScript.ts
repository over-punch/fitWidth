// Speaker script for the talk "Width, Font Size, Tracking: Who Really Does the Fitting?": one entry per slide, shared by the deck (presenter notes) and the transcript page.

/**
 * One slide's script: its deck id, a label (the headline shown on that slide, so the transcript and the deck match), and the spoken text with [bracketed] cues for builds and cuts.
 * Delivery marks: " / " a short pause or breath, " // " a longer beat, *word* stress. Quotes are never read
 * out: they are on the slides. [Next] cues mark where a build appears; the deck plays builds on its own
 * (one click per slide), so they are not clicks, but they must still match each slide's build count.
 */
export interface ScriptEntry {
	id: string
	label: string
	text: string
}

/** The script in slide order. Use typographic apostrophes (’) only: a straight one breaks this file. */
export const SCRIPT: ScriptEntry[] = [
	{ id: 'cover', label: 'Width, font size, tracking: who really does the fitting?', text: 'Hi. / I’m Quinn Keaveney, / speaking to you from Vancouver. // At Overpunch we make fitWidth, / a small library that fits a headline to its box. / This talk is what we found / when we measured how it does that.' },
	{ id: 'promise', label: 'Change the width, not the size.', text: 'A variable font is one file / that holds a range of designs. / Some have a width axis: / a setting that makes the letters themselves / narrower or wider. // That suggests a way to fit a headline: / leave the size alone, / add no spacing of your own, / and change the width. [Next] The OpenType spec suggests it too, / for small adjustments. // Laurence Penney showed it working in twenty sixteen.' },
	{ id: 'census', label: '97 of 1,950 families have a width axis.', text: 'We counted. // Google Fonts has just under two thousand families. [Next] Five hundred and sixty-one are variable. [Next] *Ninety-seven* have a width axis. [Next] In forty-nine of those, / the axis stops at a hundred, / the normal width. / It can narrow a headline. / It *can’t* widen one. // Most of those forty-nine are Noto.' },
	{ id: 'reach', label: 'Half can’t go below 80%. Half can’t go past 113%.', text: 'We measured twenty-one of them in Chrome, / across the range fitWidth searches by default. [Next] Half couldn’t take a headline / below eighty percent of its width. / Half couldn’t take it / past a hundred and thirteen. // These are free fonts, / and we picked the twenty-one by hand.' },
	{ id: 'opsz', label: 'In Roboto Flex, the reach shrinks with size.', text: 'In one font it also depends on size. // This is Roboto Flex, / which redraws itself as it gets smaller. / At a hundred and forty-four pixels, / its narrow end takes twenty percent off a headline. [Next] At thirty-six pixels, / a phone headline, / eleven. / At fourteen, / less than four.' },
	{ id: 'exception', label: 'Some families have a long width range.', text: 'Some families go much further. / This is Anybody. / Across its whole axis / it goes from under forty percent / to over a hundred and sixty. // If that’s the look you want, / choose a family like this. / A script can’t add range the designer didn’t draw.' },
	{ id: 'grid', label: 'One headline, 336 boxes.', text: 'Then we ran fitWidth on all twenty-one. / One headline, / and sixteen boxes for each font, / from half the headline’s width to double. / Three hundred and thirty-six tries. [Next] The width axis alone / fitted seventy-five. [Next] Our default adds letter-spacing, / and fitted two hundred and ninety-four. [Next] Font size, / which isn’t released yet, / fitted all of them. // That last number flatters us: / the widest box we tested / is exactly as far as we let the size grow.' },
	{ id: 'tracking', label: 'Tracking fits by pulling the letters apart.', text: 'Most of those fits came from letter-spacing, / which typographers call tracking. // This headline is tracked out to fit its box. [Next] This is the same headline in the same box, / fitted by size. // Matthew Butterick’s rule / is that lowercase doesn’t ordinarily need letter-spacing. / Our default was adding a lot.' },
	{ id: 'bug', label: 'The last letter misses the edge.', text: 'Testing this, / we measured something we’d missed. // Chrome adds the spacing after the *last* letter too, / and fitWidth counts that gap as text. [Next] A tracked headline / typically stops eight or nine pixels from the edge of its box. // There’s now an option that trims it.' },
	{ id: 'demo', label: 'The same headline, fitted four ways.', text: 'This is the demo on fitwidth.com. [Cut to demo: the default state, rows one and two; narrow the box until the axis fits alone; widen it past the size limit; switch to Roboto, then to Anybody.] Each row is one way of fitting. // Here the width axis is at its limit, / and it’s a hundred and twenty-nine pixels short. // Narrow the box, / and the axis manages alone. // Widen it, / and the rows run out one at a time. / When a row can’t fit, / it stops, / and says how far off it is.' },
	{ id: 'order', label: 'Axis, then size, then very little tracking.', text: 'This is the order we’d use now. // [Next] The width axis first, / for the last ten or twenty percent. [Next] Then font size, / inside limits you set. [Next] Then tracking, / and very little of it. // The size step is in our repository, / and not yet in the published package.' },
	{ id: 'limits', label: 'Size costs height, and stops at half and double.', text: 'It has costs. // [Next] A bigger headline is a taller line, / and whatever sits under it moves. [Next] And it stops at half size. / In a very narrow box it overflows, / where our default would crush the letters together / and call that a fit.' },
	{ id: 'css', label: 'CSS is getting text-fit. It scales the text.', text: 'CSS is getting its own answer. // A new property, / text-fit, / scales the text to fill the line. [Next] The Chrome team looked at the width axis / and left it out of the first version. // In Chrome it’s still an experimental setting. / If it ships, / and a full box is all you want, / use it.' },
	{ id: 'close', label: 'Measure the axis before you promise the fit.', text: 'So before you tell anyone / a font will stretch to fit, / *measure* how far its width axis goes. / Put your headline and your font into fitwidth.com, / and it shows you. // Whatever the axis can’t cover / will come from size or from spacing, / and you should be the one who decides which.' },
	{ id: 'about', label: 'We’re Overpunch.', text: 'We’re Overpunch. // We’ve built websites for type foundries for fifteen years. / fitWidth is one of our type tools, / and we’re now building Typetin, / a storefront for independent foundries. // The demo, / the paper / and the data / are at fitwidth.com. // Thank you.' },
]

/** Script text keyed by slide id, for the deck's presenter notes (build cues removed: the deck plays builds on its own). */
export const SCRIPT_NOTES: Record<string, string> = Object.fromEntries(SCRIPT.map(e => [e.id, e.text.replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim()]))

/** Strips [bracketed] build and cut cues, leaving only the spoken words with their delivery marks. */
export function spoken(text: string): string {
	return text.replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Strips delivery marks too (pauses and *stress*), leaving plain prose. */
export function plain(text: string): string {
	return spoken(text).replace(/[{}]/g, '').replace(/\s*\/\/?\s*/g, ' ').replace(/\*([^*]+)\*/g, '$1').replace(/\s+([,.;:!?”])/g, '$1').replace(/\s+/g, ' ').trim()
}
