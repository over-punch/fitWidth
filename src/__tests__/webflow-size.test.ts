// fitWidth/src/__tests__/webflow-size.test.ts — the Webflow embed reads data-fw-size into the size option.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/** Mocks layout: the heading is 4px per px of font size (default 100px), the parent is `parentW`. */
function mockLayout(parentW: number) {
	const orig = Element.prototype.getBoundingClientRect
	Element.prototype.getBoundingClientRect = function (this: Element) {
		const el = this as HTMLElement
		const w = el.tagName === 'H1' ? 4 * (parseFloat(el.style.fontSize) || 100) : parentW
		return { width: w, height: 20, top: 0, left: 0, right: w, bottom: 20, x: 0, y: 0, toJSON: () => {} } as DOMRect
	}
	return () => { Element.prototype.getBoundingClientRect = orig }
}

/** A 100px heading with the given data attributes inside a container div. */
function make(attrs: Record<string, string>) {
	const parent = document.createElement('div')
	const el = document.createElement('h1')
	el.textContent = 'Fit'
	el.style.fontSize = '100px'
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
	parent.appendChild(el)
	document.body.appendChild(parent)
	return el
}

let restore: (() => void) | null = null
beforeEach(() => { document.body.innerHTML = ''; vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { restore?.(); restore = null; vi.restoreAllMocks() })

describe('Webflow embed: data-fw-size', () => {
	it('leaves font size alone without the attribute, and sizes with it', async () => {
		restore = mockLayout(600)
		const { init } = await import('../webflow/embed')
		const plain = make({ 'data-fitwidth': '' })
		const sized = make({ 'data-fitwidth': '', 'data-fw-size': 'true' })
		const ranged = make({ 'data-fitwidth': '', 'data-fw-size': '0.8-1.2' })
		const dashed = make({ 'data-fitwidth': '', 'data-fw-size': '0.8–1.3' })
		const junk = make({ 'data-fitwidth': '', 'data-fw-size': 'big' })
		init()
		expect(plain.style.fontSize).toBe('100px')
		// The mocked font has no wdth axis, so font size does the fit: 600px needs 150px.
		expect(parseFloat(sized.style.fontSize)).toBeGreaterThan(149.8)
		expect(parseFloat(sized.style.fontSize)).toBeLessThanOrEqual(150)
		expect(sized.style.fontSize).toMatch(/px$/)
		expect(ranged.style.fontSize).toBe('120px') // capped at 1.2×
		expect(dashed.style.fontSize).toBe('130px') // an en dash works too
		expect(junk.style.fontSize).toBe('100px')
	})

	it('reads data-fw-trim into trimTrailingSpace (inline-block elements only)', async () => {
		restore = mockLayout(600)
		const { init } = await import('../webflow/embed')
		const trimmed = make({ 'data-fitwidth': '', 'data-fw-trim': 'true' })
		trimmed.style.display = 'inline-block'
		const off = make({ 'data-fitwidth': '', 'data-fw-trim': 'false' })
		off.style.display = 'inline-block'
		const warn = console.warn as unknown as { mock: { calls: string[][] } }
		init()
		// The mocked heading ignores letter-spacing, so nothing is written; the option must still be
		// accepted without the "needs an element that sizes itself" warning on an inline-block element.
		expect(warn.mock.calls.some((c) => String(c[0]).includes('trimTrailingSpace'))).toBe(false)
		expect(off.style.marginRight).toBe('')
		expect(trimmed.style.fontSize).toBe('100px')
	})
})
