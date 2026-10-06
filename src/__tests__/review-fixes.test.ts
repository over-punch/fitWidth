// fitWidth/src/__tests__/review-fixes.test.ts — regression tests for the 2026-10 review: never overshoot, content-box target, options, saved styles.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { applyFitWidth, removeFitWidth } from '../core/adjust'

/** Width of the measuring clone: 4px per wdth unit plus 3px per px of added letter-spacing (3 letters). */
function cloneWidth(el: HTMLElement): number {
	const m = /"wdth"\s+([\d.]+)/.exec(el.style.fontVariationSettings)
	const wdth = m ? parseFloat(m[1]) : 100
	const ls = /\+ ([-\d.e]+)px\)/.exec(el.style.letterSpacing)
	return 4 * wdth + 0.3 + (ls ? 3 * parseFloat(ls[1]) : 0)
}

/** Mocks layout: the parent reports `parentW` (plus any padding in its inline style), the clone follows its styles. */
function mockLayout(parentW: number) {
	const orig = Element.prototype.getBoundingClientRect
	Element.prototype.getBoundingClientRect = function (this: Element) {
		const el = this as HTMLElement
		const w = el.hasAttribute('data-fitwidth-probe') ? cloneWidth(el) : parentW
		return { width: w, height: 20, top: 0, left: 0, right: w, bottom: 20, x: 0, y: 0, toJSON: () => {} } as DOMRect
	}
	return () => { Element.prototype.getBoundingClientRect = orig }
}

/** A heading inside a container div. */
function make(parentStyle = '', html = 'Fit') {
	const parent = document.createElement('div')
	parent.setAttribute('style', parentStyle)
	const el = document.createElement('h1')
	el.innerHTML = html
	parent.appendChild(el)
	document.body.appendChild(parent)
	return { parent, el }
}

let restore: (() => void) | null = null
beforeEach(() => { document.body.innerHTML = ''; vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { restore?.(); restore = null; vi.restoreAllMocks() })

describe('the fit never overshoots', () => {
	it('ends at or under the target, within tolerance', () => {
		restore = mockLayout(450)
		const { el } = make()
		applyFitWidth(el, { prefer: 'axis' })
		const clone = document.createElement('h1')
		clone.setAttribute('data-fitwidth-probe', '')
		clone.style.fontVariationSettings = el.style.fontVariationSettings
		const w = cloneWidth(clone)
		expect(w).toBeLessThanOrEqual(450)
		expect(w).toBeGreaterThanOrEqual(450 - 0.5)
	})

	it('removes the measuring clone', () => {
		restore = mockLayout(450)
		const { parent, el } = make()
		applyFitWidth(el)
		expect(parent.querySelectorAll('[data-fitwidth-probe]').length).toBe(0)
		expect(parent.children.length).toBe(1)
	})
})

describe('target', () => {
	it('subtracts the container padding', () => {
		restore = mockLayout(450)
		const { el } = make('padding: 0 25px')
		applyFitWidth(el, { prefer: 'axis' })
		const m = /"wdth"\s+([\d.]+)/.exec(el.style.fontVariationSettings)!
		// content width 400 → wdth ≈ (400 - 0.3) / 4
		expect(4 * parseFloat(m[1]) + 0.3).toBeLessThanOrEqual(400)
		expect(4 * parseFloat(m[1]) + 0.3).toBeGreaterThan(399)
	})

	it('treats a null target (an unattached ref) as the container instead of throwing', () => {
		restore = mockLayout(450)
		const { el } = make()
		expect(() => applyFitWidth(el, { target: null })).not.toThrow()
		expect(el.style.fontVariationSettings).toContain('wdth')
	})

	it('warns and fills the container for an unsupported string target', () => {
		restore = mockLayout(450)
		const { el } = make()
		expect(() => applyFitWidth(el, { target: '300px' as unknown as number })).not.toThrow()
		expect(console.warn).toHaveBeenCalled()
	})
})

describe('options and saved styles', () => {
	it('rejects an axis string that would inject other axes', () => {
		restore = mockLayout(450)
		const { el } = make()
		applyFitWidth(el, { axis: 'wdth" 50, "wght' })
		expect(el.style.fontVariationSettings).toBe('')
	})

	it('leaves an empty element untouched', () => {
		restore = mockLayout(450)
		const { el } = make('', '  ')
		applyFitWidth(el)
		expect(el.hasAttribute('style')).toBe(false)
	})

	it('removeFitWidth leaves no empty style attribute', () => {
		restore = mockLayout(450)
		const { el } = make()
		applyFitWidth(el)
		removeFitWidth(el)
		expect(el.hasAttribute('style')).toBe(false)
	})

	it('keeps a font-variation-settings the author sets after the first fit', () => {
		restore = mockLayout(450)
		const { el } = make()
		applyFitWidth(el, { prefer: 'axis' })
		el.style.fontVariationSettings = '"wght" 800'
		applyFitWidth(el, { prefer: 'axis' })
		removeFitWidth(el)
		expect(el.style.fontVariationSettings).toBe('"wght" 800')
	})
})
