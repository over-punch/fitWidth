// Open Graph image for fitwidth.com/paper/data, rendered by the shared talk OG component in fitWidth's palette.
import { talkOgImage, TALK_OG_SIZE } from '../../../components/talk/talkOg'

export const alt = 'Width, Font Size, Tracking: Who Really Does the Fitting? Data'
export const size = TALK_OG_SIZE
export const contentType = 'image/png'

/** Renders this route's OG image. */
export default function Image() {
	return talkOgImage({ tool: 'fitWidth', eyebrow: 'The data · Fit Width', title: ['Width, size, tracking:', 'who does the fitting?'], footnote: '97 width axes, 21 measured reaches, 336 fits.', path: 'fitwidth.com/paper/data' })
}
