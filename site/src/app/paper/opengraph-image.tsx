// Open Graph image for fitwidth.com/paper, rendered by the shared talk OG component in fitWidth's palette.
import { talkOgImage, TALK_OG_SIZE } from '../../components/talk/talkOg'

export const alt = 'Width, Font Size, Tracking: Who Really Does the Fitting? Paper'
export const size = TALK_OG_SIZE
export const contentType = 'image/png'

/** Renders this route's OG image. */
export default function Image() {
	return talkOgImage({ tool: 'fitWidth', eyebrow: 'The paper · Fit Width', title: ['Width, size, tracking:', 'who does the fitting?'], footnote: 'A census, 21 measured families and a 336-case test.', path: 'fitwidth.com/paper' })
}
