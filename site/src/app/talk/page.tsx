// Public talk deck route (fitwidth.com/talk) — "Width, Font Size, Tracking: Who Really Does the Fitting?", rendered with the Type Tools site system.
import type { Metadata } from 'next'
import Deck from '../../components/talk/Deck'

export const metadata: Metadata = {
	title: 'Width, Font Size, Tracking: Who Really Does the Fitting? A talk | Fit Width',
	description: 'How far does a variable font’s width axis move a headline? 97 of 1,950 Google Fonts families have one; in 21 we measured, the median reach is 80% to 113% of natural width.',
	alternates: { canonical: 'https://fitwidth.com/talk' },
	openGraph: {
		title: 'Width, Font Size, Tracking: Who Really Does the Fitting? A talk',
		description: 'In most fonts the width axis is a fine adjustment. Measurements from 21 families, and the fitting order that follows.',
		url: 'https://fitwidth.com/talk',
		siteName: 'Fit Width',
		type: 'website',
	},
}

/** Renders the full-viewport slide deck. Arrow keys / space to navigate, N for notes, F for fullscreen. */
export default function TalkPage() {
	return <Deck />
}
