// fitWidth/src/__tests__/size-and-result.test.ts — the opt-in font-size stage, the result object and onFit.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { applyFitWidth, removeFitWidth } from '../core/adjust'
import type { FitWidthResult } from '../core/types'

/** Number of letters in the mocked text ("Fit"). */
const LETTERS = 3

/** The font's own wdth range in the mock: values outside it are clamped, as a browser does. */
const FONT_WDTH = { min: 75, max: 125 }

/** Font size (px) of a mocked element: its inline size, or the 100px default. */
function fontSizeOf(el: HTMLElement): number {
	return parseFloat(el.style.fontSize) || 100
}

/** Letter-spacing (px) of a mocked element: the sum of its em and px terms. */
function spacingOf(el: HTMLElement): number {
	const ls = el.style.letterSpacing
	let px = 0
	for (const m of ls.matchAll(/(-?[\d.]+(?:e-?\d+)?)(em|px)/g)) px += parseFloat(m[1]) * (m[2] === 'em' ? fontSizeOf(el) : 1)
	return px
}

/**
 * Width of a mocked element: 4px per wdth unit at 100px font size (wdth clamped to the font's range),
 * scaled by font size, plus letter-spacing after each letter. At wdth 100, 100px: 400px.
 */
function textWidth(el: HTMLElement, hasAxis = true): number {
	const m = /"wdth"\s+([\d.]+)/.exec(el.style.fontVariationSettings)
	const raw = m ? parseFloat(m[1]) : 100
	const wdth = hasAxis ? Math.min(FONT_WDTH.max, Math.max(FONT_WDTH.min, raw)) : 100
	// Any non-zero letter-spacing turns ligatures off: the mocked "fi" splits and the text jumps wider.
	const split = spacingOf(el) !== 0 ? ligatureJump : 0
	return 4 * wdth * (fontSizeOf(el) / 100) + LETTERS * spacingOf(el) + split
}

/** Extra width (px) the mocked text gains when a ligature splits; 0 for a font without one. */
let ligatureJump = 0

/** Mocks layout: the parent reports `parentW`; the measuring clone and the element follow their styles. */
function mockLayout(parentW: number, hasAxis = true) {
	const orig = Element.prototype.getBoundingClientRect
	Element.prototype.getBoundingClientRect = function (this: Element) {
		const el = this as HTMLElement
		const w = el.tagName === 'H1' ? textWidth(el, hasAxis) : parentW
		return { width: w, height: 20, top: 0, left: 0, right: w, bottom: 20, x: 0, y: 0, toJSON: () => {} } as DOMRect
	}
	return () => { Element.prototype.getBoundingClientRect = orig }
}

/** A 100px heading ("Fit") inside a container div. */
function make(style = 'font-size: 100px') {
	const parent = document.createElement('div')
	const el = document.createElement('h1')
	if (style) el.setAttribute('style', style)
	el.textContent = 'Fit'
	parent.appendChild(el)
	document.body.appendChild(parent)
	return { parent, el }
}

let restore: (() => void) | null = null
beforeEach(() => { document.body.innerHTML = ''; vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { restore?.(); restore = null; ligatureJump = 0; vi.restoreAllMocks() })

describe('the result object', () => {
	it('reports a fit the axis reached on its own', () => {
		restore = mockLayout(450)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		expect(r.status).toBe('fit')
		expect(r.target).toBe(450)
		expect(r.natural).toBe(400)
		expect(r.width).toBeLessThanOrEqual(450)
		expect(r.width).toBeGreaterThanOrEqual(449.5)
		expect(r.axis).toBe('wdth')
		expect(r.axisValue).toBeGreaterThan(112)
		expect(r.axisValue).toBeLessThanOrEqual(112.5)
		expect(r.tracking).toBe(0)
		expect(r.fontSize).toBe(100)
		expect(r.ratios.size).toBe(1)
		expect(r.ratios.tracking).toBe(1)
		expect(r.ratios.axis).toBeCloseTo(r.width / r.natural, 6)
		expect(r.limits).toEqual({ axis: null, size: null, tracking: null })
	})

	it('multiplies out: axis × size × tracking = width / natural', () => {
		restore = mockLayout(1100)
		const { el } = make()
		const r = applyFitWidth(el, { size: { min: 0.5, max: 2 } }) as FitWidthResult
		expect(r.ratios.axis * r.ratios.size * r.ratios.tracking).toBeCloseTo(r.width / r.natural, 6)
	})

	it('says the text falls short when the default ranges run out, and where each stage ended', () => {
		restore = mockLayout(900)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		// wdth 125 → 500px; +0.3em in the 2 gaps between 3 letters at 100px → 560px. Still 340px short of 900.
		expect(r.status).toBe('short')
		expect(r.axisValue).toBe(125)
		expect(r.limits.axis).toBe('max')
		expect(r.limits.tracking).toBe('max')
		expect(r.tracking).toBeCloseTo(0.3, 3)
		expect(r.width).toBeCloseTo(560, 0)
		expect(r.gap).toBeCloseTo(-340, 0)
		expect(el.style.fontSize).toBe('100px')
	})

	it('says the text overflows when it is still too wide at the narrow ends', () => {
		restore = mockLayout(150)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		// wdth 75 → 300px; −0.3em × 3 × 100 → 210px. Still wider than 150.
		expect(r.status).toBe('overflow')
		expect(r.limits.axis).toBe('min')
		expect(r.limits.tracking).toBe('min')
		expect(r.gap).toBeGreaterThan(0.5)
	})

	it('calls a sliver over the target an overflow, never a fit', () => {
		// −0.3em in 2 gaps at 100px takes 300px (wdth 75) to 240px: 0.2px wider than a 239.8px box.
		restore = mockLayout(239.8)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		expect(r.gap).toBeGreaterThan(0)
		expect(r.gap).toBeLessThan(0.5)
		expect(r.status).toBe('overflow')
	})

	it('reports tracking as stepped when a ligature split jumps the width past the target', () => {
		// wdth 125 → 500px. Any letter-spacing adds 12px at once, so 505px can't be reached by tracking.
		ligatureJump = 12
		restore = mockLayout(505)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		expect(r.status).toBe('short')
		expect(r.width).toBe(500)
		expect(r.tracking).toBe(0)
		expect(r.limits.tracking).toBe('stepped')
		// Font size keeps the ligature, so `size` reaches the same target.
		const sized = applyFitWidth(el, { size: true }) as FitWidthResult
		expect(sized.status).toBe('fit')
		expect(sized.tracking).toBe(0)
	})

	it('marks an axis the font does not have as inert', () => {
		restore = mockLayout(450, false)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		expect(r.limits.axis).toBe('inert')
		expect(r.ratios.axis).toBe(1)
		expect(r.status).toBe('fit') // tracking closed it: 50px over 3 letters at 100px
		expect(r.tracking).toBeGreaterThan(0.16)
	})

	it('leaves the axis null for prefer: tracking', () => {
		restore = mockLayout(450)
		const { el } = make()
		const r = applyFitWidth(el, { prefer: 'tracking' }) as FitWidthResult
		expect(r.axis).toBeNull()
		expect(r.axisValue).toBeNull()
		expect(el.style.fontVariationSettings).toBe('')
		expect(r.status).toBe('fit')
	})

	it('calls onFit with the same object it returns', () => {
		restore = mockLayout(450)
		const { el } = make()
		const onFit = vi.fn()
		const r = applyFitWidth(el, { onFit })
		expect(onFit).toHaveBeenCalledTimes(1)
		expect(onFit.mock.calls[0][0]).toBe(r)
	})

	it('returns null and does not call onFit when nothing is fitted', () => {
		restore = mockLayout(450)
		const { el } = make()
		el.textContent = '   '
		const onFit = vi.fn()
		expect(applyFitWidth(el, { onFit })).toBeNull()
		expect(applyFitWidth(el, { axis: 'bad-axis', onFit })).toBeNull()
		expect(onFit).not.toHaveBeenCalled()
	})
})

describe('size is off by default', () => {
	it('never writes font-size, however far the target is', () => {
		for (const w of [100, 300, 450, 900, 2000]) {
			document.body.innerHTML = ''
			restore?.()
			restore = mockLayout(w)
			const { el } = make('')
			const r = applyFitWidth(el) as FitWidthResult
			expect(el.style.fontSize).toBe('')
			expect(r.fontSize).toBe(parseFloat(getComputedStyle(el).fontSize))
			expect(r.ratios.size).toBe(1)
			expect(r.limits.size).toBeNull()
		}
	})

	it('keeps the ±0.3em tracking default', () => {
		restore = mockLayout(900)
		const { el } = make()
		expect((applyFitWidth(el) as FitWidthResult).tracking).toBeCloseTo(0.3, 3)
	})
})

describe('size: font size takes over when the axis runs out', () => {
	it('leaves font size alone when the axis reaches the target', () => {
		restore = mockLayout(450)
		const { el } = make()
		const r = applyFitWidth(el, { size: true }) as FitWidthResult
		expect(el.style.fontSize).toBe('100px')
		expect(r.fontSize).toBe(100)
		expect(r.ratios.size).toBe(1)
		expect(r.status).toBe('fit')
	})

	it('grows the font when the widest axis value falls short, and fits without tracking', () => {
		restore = mockLayout(900)
		const { el } = make()
		const r = applyFitWidth(el, { size: true }) as FitWidthResult
		// wdth 125 → 500px at 100px; 900 needs 180px.
		expect(r.status).toBe('fit')
		expect(r.axisValue).toBe(125)
		expect(r.limits.axis).toBe('max')
		expect(r.fontSize).toBeGreaterThan(179.8)
		expect(r.fontSize).toBeLessThanOrEqual(180)
		expect(parseFloat(el.style.fontSize)).toBeCloseTo(r.fontSize, 2)
		expect(r.tracking).toBe(0)
		expect(el.style.letterSpacing).toBe('')
		expect(r.width).toBeLessThanOrEqual(900)
		expect(r.width).toBeGreaterThanOrEqual(899.5)
		expect(r.ratios.axis).toBeCloseTo(1.25, 3)
		expect(r.ratios.size).toBeCloseTo(1.8, 2)
		// The element itself now measures what the result says.
		expect(textWidth(el)).toBeCloseTo(r.width, 3)
	})

	it('shrinks the font when the narrowest axis value still overflows', () => {
		restore = mockLayout(150)
		const { el } = make()
		const r = applyFitWidth(el, { size: true }) as FitWidthResult
		// wdth 75 → 300px at 100px; 150 needs 50px, the 0.5× floor.
		expect(r.status).toBe('fit')
		expect(r.axisValue).toBe(75)
		expect(r.fontSize).toBeLessThanOrEqual(50)
		expect(r.fontSize).toBeGreaterThan(49.8)
		expect(textWidth(el)).toBeLessThanOrEqual(150)
	})

	it('caps tracking at 0.05em by default and reports falling short past the size limit', () => {
		restore = mockLayout(2000)
		const { el } = make()
		const r = applyFitWidth(el, { size: true }) as FitWidthResult
		// wdth 125 × 2× size → 1000px; +0.05em in 2 gaps at 200px → 1020px.
		expect(r.fontSize).toBe(200)
		expect(r.limits.size).toBe('max')
		expect(r.tracking).toBeCloseTo(0.05, 3)
		expect(r.limits.tracking).toBe('max')
		expect(r.status).toBe('short')
		expect(r.width).toBeCloseTo(1020, 0)
		// The element's box still holds the space after the last letter; the margin cancels it.
		expect(textWidth(el) - spacingOf(el)).toBeCloseTo(r.width, 2)
	})

	it('honours an explicit maxTracking and custom multipliers', () => {
		restore = mockLayout(660)
		const { el } = make()
		const r = applyFitWidth(el, { size: { min: 0.8, max: 1.2 }, maxTracking: 0.3 }) as FitWidthResult
		// wdth 125 × 1.2 → 600px; +0.3em in 2 gaps at 120px reaches 672px, so tracking closes 660 at 0.25em.
		expect(r.fontSize).toBe(120)
		expect(r.limits.size).toBe('max')
		expect(r.status).toBe('fit')
		expect(r.tracking).toBeGreaterThan(0.245)
		expect(r.tracking).toBeLessThanOrEqual(0.25)
	})

	it('uses font size, then tracking, and never the axis for prefer: tracking', () => {
		restore = mockLayout(600)
		const { el } = make()
		const r = applyFitWidth(el, { prefer: 'tracking', size: true }) as FitWidthResult
		expect(el.style.fontVariationSettings).toBe('')
		expect(r.axisValue).toBeNull()
		expect(r.fontSize).toBeGreaterThan(149.8)
		expect(r.status).toBe('fit')
	})

	it('adds no tracking for prefer: axis, even past the size limit', () => {
		restore = mockLayout(2000)
		const { el } = make()
		const r = applyFitWidth(el, { prefer: 'axis', size: true }) as FitWidthResult
		expect(r.tracking).toBe(0)
		expect(el.style.letterSpacing).toBe('')
		expect(r.status).toBe('short')
	})

	it('is idempotent and re-fits from the original size', () => {
		restore = mockLayout(900)
		const { el, parent } = make()
		const a = applyFitWidth(el, { size: true }) as FitWidthResult
		const b = applyFitWidth(el, { size: true }) as FitWidthResult
		expect(b.fontSize).toBe(a.fontSize)
		expect(b.natural).toBe(400)
		restore()
		restore = mockLayout(450)
		void parent
		const c = applyFitWidth(el, { size: true }) as FitWidthResult
		expect(c.fontSize).toBe(100)
		expect(el.style.fontSize).toBe('100px')
	})

	it('removeFitWidth restores the font size and leaves no style attribute behind', () => {
		restore = mockLayout(900)
		const { el } = make('')
		applyFitWidth(el, { size: true })
		expect(el.style.fontSize).not.toBe('')
		removeFitWidth(el)
		expect(el.style.fontSize).toBe('')
		expect(el.hasAttribute('style')).toBe(false)

		const second = make('font-size: 100px')
		applyFitWidth(second.el, { size: true })
		removeFitWidth(second.el)
		expect(second.el.getAttribute('style')).toBe('font-size: 100px;')
	})

	it('keeps a font size the author sets after a fit as the new original', () => {
		restore = mockLayout(900)
		const { el } = make()
		applyFitWidth(el, { size: true })
		el.style.fontSize = '50px'
		const r = applyFitWidth(el, { size: true }) as FitWidthResult
		expect(r.natural).toBe(200)
		removeFitWidth(el)
		expect(el.style.fontSize).toBe('50px')
	})

	it('scales the author’s letter-spacing with the fitted size', () => {
		restore = mockLayout(900)
		const { el } = make('font-size: 100px; letter-spacing: 10px')
		const r = applyFitWidth(el, { size: true }) as FitWidthResult
		// 10px at 100px is 0.1em: carried in em, so it grows with the font.
		expect(el.style.letterSpacing).toBe('0.1em')
		expect(r.status).toBe('fit')
		expect(textWidth(el)).toBeCloseTo(r.width, 2)
		expect(textWidth(el)).toBeLessThanOrEqual(900)
		removeFitWidth(el)
		expect(el.style.letterSpacing).toBe('10px')
	})

	it('ignores an invalid size option with a warning', () => {
		restore = mockLayout(900)
		const { el } = make()
		const r = applyFitWidth(el, { size: { min: 2, max: 1 } }) as FitWidthResult
		expect(console.warn).toHaveBeenCalled()
		expect(r.fontSize).toBe(100)
		expect(el.style.fontSize).toBe('100px')
	})
})

describe('tracking lands the last letter on the target', () => {
	it('does not count the space after the last letter, and cancels it with a right margin', () => {
		// wdth 125 → 500px; a 540px box needs 40px in the 2 gaps: 0.2em. The box then holds 60px of spacing.
		restore = mockLayout(540)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		expect(r.status).toBe('fit')
		expect(r.tracking).toBeGreaterThan(0.197)
		expect(r.tracking).toBeLessThanOrEqual(0.2)
		const lastLetterEnd = textWidth(el) - spacingOf(el)
		expect(lastLetterEnd).toBeLessThanOrEqual(540)
		expect(lastLetterEnd).toBeGreaterThanOrEqual(539.5)
		expect(el.style.marginRight).toMatch(/em$/)
		expect(parseFloat(el.style.marginRight)).toBeCloseTo(-r.tracking, 5)
	})

	it('keeps the last letter inside the box with negative tracking', () => {
		// wdth 75 → 300px; a 260px box needs −40px in 2 gaps: −0.2em.
		restore = mockLayout(260)
		const { el } = make()
		const r = applyFitWidth(el) as FitWidthResult
		expect(r.status).toBe('fit')
		expect(r.tracking).toBeLessThan(-0.2)
		expect(textWidth(el) - spacingOf(el)).toBeLessThanOrEqual(260)
		expect(parseFloat(el.style.marginRight)).toBeCloseTo(-r.tracking, 5) // a positive margin: the box is narrower than the ink
		expect(parseFloat(el.style.marginRight)).toBeGreaterThan(0)
	})

	it('adds the correction to the author’s own right margin, and restores it', () => {
		restore = mockLayout(540)
		const { el } = make('font-size: 100px; margin-right: 12px')
		const r = applyFitWidth(el) as FitWidthResult
		expect(el.style.marginRight).toMatch(/^calc\(12px \+ -0\.19\d+em\)$/)
		const first = el.style.marginRight
		applyFitWidth(el) // idempotent: starts again from the author's 12px
		expect(el.style.marginRight).toBe(first)
		expect(r.tracking).toBeGreaterThan(0.19)
		removeFitWidth(el)
		expect(el.style.marginRight).toBe('12px')
	})

	it('writes no margin when no tracking is added', () => {
		restore = mockLayout(450)
		const { el } = make()
		applyFitWidth(el)
		expect(el.style.marginRight).toBe('')
		restore()
		restore = mockLayout(900)
		applyFitWidth(el, { size: true })
		expect(el.style.marginRight).toBe('')
	})

	it('names only the levers it was allowed to use in the overflow warning', () => {
		restore = mockLayout(150)
		const { el } = make()
		applyFitWidth(el, { prefer: 'axis' })
		const msg = (console.warn as unknown as { mock: { calls: string[][] } }).mock.calls.map((c) => c[0]).find((m) => m.includes('wider than its target')) ?? ''
		expect(msg).toContain('axisMin/axisMax')
		expect(msg).not.toContain('maxTracking')
	})
})
