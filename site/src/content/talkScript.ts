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
	{ id: 'cover', label: 'Width, font size, tracking: who really does the fitting?', text: 'Hi. / I’m Quinn Keaveney, / speaking to you from Vancouver. // This talk is about fitting a headline to its box, / and about which part of the font / is actually doing the work.' },
	{ id: 'promise', label: 'Change the width, not the size.', text: 'A variable font can have a width axis: / a setting that makes the letters themselves / narrower or wider. // So the idea writes itself. / To fit a headline, / leave the *size* alone, / leave the *spacing* alone, / and change the width. [Next] The OpenType spec suggests it. / The CSS Working Group has been asked for it / since 2018.' },
	{ id: 'census', label: '97 of 1,950 families have a width axis.', text: 'So we counted. // Google Fonts has one thousand nine hundred and fifty families. [Next] Five hundred and sixty-one are variable. [Next] *Ninety-seven* have a width axis. [Next] And in forty-nine of those, / the axis stops at normal. / It can narrow a headline. / It *can’t* widen one.' },
	{ id: 'reach', label: 'The median reach is 80% to 113%.', text: 'Then we measured twenty-one of them, / in Chrome, / over our tool’s default range. [Next] The middle font takes a headline / down to eighty percent of its width, / and up to a hundred and thirteen. // Two separate medians, / from one free catalogue. / But that’s the reach. / A fine adjustment.' },
	{ id: 'opsz', label: 'The same font reaches less at small sizes.', text: 'And it isn’t constant. // This is Roboto Flex. / At a hundred and forty-four pixels, / the narrow end takes off twenty percent. [Next] At fourteen pixels, / under four. // A headline that fits on a desktop / can run out of axis on a phone.' },
	{ id: 'exception', label: 'Fonts drawn for width are the exception.', text: 'There *are* exceptions. // Some fonts were drawn for width. / This one, Anybody, / goes from under forty percent / to over a hundred and sixty. // If that’s the look you want, / choose a font like this. / A script can’t add range the designer didn’t draw.' },
	{ id: 'grid', label: 'The axis alone fitted 75 of 336.', text: 'So what does a fitting tool do with an ordinary font? // We ran ours. / One headline, / twenty-one fonts, / sixteen box widths each, / from half to double. [Next] The axis alone fitted seventy-five / of three hundred and thirty-six. [Next] Add letter-spacing, / which is our default: / two hundred and eighty-six. [Next] Use font size instead, / with almost no spacing: / all of them. / Though that grid stops exactly where our size limit does.' },
	{ id: 'tracking', label: 'Tracking fits. It also takes the spacing apart.', text: 'So in our default, / letter-spacing does most of the fitting. // Here’s what that looks like. / Same headline, / same box. [Next] One is spaced out to fit. / The other is simply *bigger*. // Spacing also switches off ligatures. / And squeezed the other way, / the letters collide.' },
	{ id: 'bug', label: 'Our own fit was nine pixels off.', text: 'Testing this, / we found a bug in our own tool. // Browsers add spacing after the *last* letter too, / and we were counting it. [Next] So a spaced-out fit / ended about nine pixels from the edge. // It’s fixed in the repository, / and it’s written up in the paper.' },
	{ id: 'demo', label: 'One headline, one box, four strategies.', text: 'Here it is, live. [Cut to demo: the default state; drag the box narrower until the axis fits alone; drag it wider, past the size limit; switch to Roboto, then to Anybody.] Every row prints what it changed, / and whether it fits. / When it can’t, / it stops, / and says by how much.' },
	{ id: 'order', label: 'Axis, then size, then very little tracking.', text: 'So here’s the order we’d use now. // [Next] The width axis first, / for the last ten or twenty percent. [Next] Then font size, / inside limits you set. [Next] Then letter-spacing: / a few hundredths of an em, / no more. // That’s an option in our repository today. / It is *not* our default, / and it isn’t released yet.' },
	{ id: 'limits', label: 'It costs height, and it has limits.', text: 'It isn’t free. // [Next] A bigger headline is a taller line, / and whatever sits under it moves. [Next] And in a very narrow box, / it overflows, / where heavy negative spacing would still squeeze in. / Unreadably, / but in. // No order wins every time.' },
	{ id: 'css', label: 'CSS is getting text-fit. It scales the text.', text: 'Meanwhile, / CSS has picked a side. // There’s a new property, / text-fit, / and it scales the text. [Next] The width axis was considered, / and left out. // In Chrome it’s still behind a flag. / When it ships, / and filling the box is all you want, / use that.' },
	{ id: 'close', label: 'Measure the axis before you promise the fit.', text: 'So, / before you promise a designer / that the font will stretch to fit, / *measure* it. // In most fonts / the width axis is a fine adjustment. / Something else does the fitting. / Choose it on purpose.' },
	{ id: 'about', label: 'We’re Overpunch.', text: 'We’re Overpunch. // We’ve built websites for type foundries for fifteen years, / we make type tools for the web, / and we’re building Typetin, / a storefront for independent foundries. // The demo, / the paper / and the data / are at fitwidth.com. // Thank you.' },
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
