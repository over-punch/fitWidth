// Open Graph image for fitwidth.com/talk/transcript, rendered by the shared talk OG component in fitWidth's palette.
import { talkOgImage, TALK_OG_SIZE } from '../../../components/talk/talkOg'

export const alt = 'Width, Font Size, Tracking: Who Really Does the Fitting? Transcript'
export const size = TALK_OG_SIZE
export const contentType = 'image/png'

/** Renders this route's OG image. */
export default function Image() {
	return talkOgImage({ tool: 'fitWidth', eyebrow: 'Transcript · Fit Width', title: ['Width, size, tracking:', 'who does the fitting?'], footnote: 'The full spoken script, one section per slide.', path: 'fitwidth.com/talk/transcript' })
}
