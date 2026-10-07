// fitWidth/src/webflow/embed.ts — zero-config browser bundle for Webflow Custom Code Embed.
// Fits any element marked with [data-fitwidth] to its target width, reading options from
// data-* attributes, and re-fits when a container resizes, when fonts load and when new
// [data-fitwidth] elements are added. Exposes a small window.FitWidth API.
import { applyFitWidth, removeFitWidth } from '../core/adjust'
import type { FitWidthOptions } from '../core/types'

/** Attribute that opts an element in to width fitting. */
const OPT_IN_ATTR = 'data-fitwidth'

/** Elements currently under management, re-fitted on resize. */
const tracked = new Set<HTMLElement>()

/**
 * Read fitWidth options from an element's data-* attributes.
 * Unset attributes fall through to the library defaults.
 *
 * Supported attributes:
 *   data-fw-target       — 'container' (default), a pixel number, or a percentage of the container
 *   data-fw-prefer       — auto | axis | tracking
 *   data-fw-axis         — variable font axis tag (default 'wdth')
 *   data-fw-axis-min     — axis search lower bound
 *   data-fw-axis-max     — axis search upper bound
 *   data-fw-max-tracking — max absolute letter-spacing in em
 *   data-fw-tolerance    — convergence tolerance in px
 *   data-fw-size         — 'true' (font size may go 0.5×–2×), or a range such as '0.6-1.5'
 *   data-fw-trim         — 'true' to count letter-spacing between letters only (inline-block elements)
 *
 * @param el - The opted-in element
 */
function readOptions(el: HTMLElement): FitWidthOptions {
	const d = el.dataset
	const opts: FitWidthOptions = {}

	if (d.fwTarget) {
		const raw = d.fwTarget.trim()
		const n = parseFloat(raw)
		if (isNaN(n)) opts.target = 'container'
		else if (raw.endsWith('%')) opts.target = (containerWidth(el) * n) / 100
		else opts.target = n
	}
	if (d.fwPrefer === 'auto' || d.fwPrefer === 'axis' || d.fwPrefer === 'tracking') {
		opts.prefer = d.fwPrefer
	}
	if (d.fwAxis) opts.axis = d.fwAxis
	if (d.fwAxisMin !== undefined) { const n = parseFloat(d.fwAxisMin); if (!isNaN(n)) opts.axisMin = n }
	if (d.fwAxisMax !== undefined) { const n = parseFloat(d.fwAxisMax); if (!isNaN(n)) opts.axisMax = n }
	if (d.fwMaxTracking !== undefined) { const n = parseFloat(d.fwMaxTracking); if (!isNaN(n)) opts.maxTracking = n }
	if (d.fwTolerance !== undefined) { const n = parseFloat(d.fwTolerance); if (!isNaN(n)) opts.tolerance = n }
	if (d.fwTrim !== undefined && d.fwTrim.trim().toLowerCase() !== 'false') opts.trimTrailingSpace = true
	if (d.fwSize !== undefined) {
		const raw = d.fwSize.trim().toLowerCase()
		// Accepts a hyphen, an en or em dash, a comma or a space between the two multipliers.
		const range = /^([\d.]+)\s*[-–—,\s]\s*([\d.]+)$/.exec(raw)
		if (range) opts.size = { min: parseFloat(range[1]), max: parseFloat(range[2]) }
		else if (raw === '' || raw === 'true') opts.size = true
	}

	return opts
}

/** The content width of an element's parent in px (padding and borders excluded). */
function containerWidth(el: HTMLElement): number {
	const parent = el.parentElement
	if (!parent) return 0
	const cs = getComputedStyle(parent)
	const px = (v: string) => parseFloat(v) || 0
	return parent.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight)
}

/** Whether an element opts in: the attribute is present and not "false". */
function optedIn(el: Element): el is HTMLElement {
	const v = el.getAttribute(OPT_IN_ATTR)
	return v !== null && v.trim().toLowerCase() !== 'false'
}

/** Watches each fitted element's container, so a container resize (not only the window) refits. */
const resizeObserver = typeof ResizeObserver !== 'undefined'
	? new ResizeObserver((entries) => {
		const parents = new Set(entries.map((e) => e.target))
		cancelAnimationFrame(roRaf)
		roRaf = requestAnimationFrame(() => {
			tracked.forEach((el) => { if (el.parentElement && parents.has(el.parentElement)) fitOne(el) })
		})
	})
	: null
let roRaf = 0

/** Fits one tracked element, or stops tracking it if it has left the page. */
function fitOne(el: HTMLElement): void {
	if (!el.isConnected) { tracked.delete(el); return }
	applyFitWidth(el, readOptions(el))
}

/**
 * Fit a single element and register it for resize re-fitting.
 *
 * @param el - Element to fit
 */
function fitElement(el: HTMLElement): void {
	if (!optedIn(el)) return
	applyFitWidth(el, readOptions(el))
	tracked.add(el)
	if (el.parentElement) resizeObserver?.observe(el.parentElement)
}

/**
 * Re-fit every tracked element. applyFitWidth resets to saved originals first,
 * so repeated calls are idempotent.
 */
function refit(): void {
	tracked.forEach(fitOne)
}

/**
 * Restore and stop tracking a single element.
 *
 * @param el - Element previously fitted
 */
function destroy(el: HTMLElement): void {
	removeFitWidth(el)
	tracked.delete(el)
}

/**
 * Scan a root for opted-in elements and fit each one.
 *
 * @param root - Element or document to search (default: document)
 */
function init(root: ParentNode = document): void {
	root.querySelectorAll<HTMLElement>(`[${OPT_IN_ATTR}]`).forEach(fitElement)
}

// Re-fit on viewport resize — the container's width drives the fit. Throttled to one
// re-fit per animation frame so a drag-resize doesn't run the search on every event.
let resizeRaf = 0
function onResize(): void {
	if (resizeRaf) cancelAnimationFrame(resizeRaf)
	resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; refit() })
}

/**
 * Auto-initialise once the DOM is parsed and web fonts have loaded.
 * Fonts must settle first: the fitted width depends on final glyph metrics,
 * which shift when a web font swaps in.
 */
function autoInit(): void {
	const run = () => {
		if (document.fonts?.ready) {
			document.fonts.ready.then(() => init()).catch(() => init())
		} else {
			init()
		}
		window.addEventListener('resize', onResize)
		// Fonts that load later change glyph widths.
		document.fonts?.addEventListener?.('loadingdone', onResize)
		// Elements added later (CMS lists, interactions) are fitted when they appear.
		if (typeof MutationObserver !== 'undefined') {
			new MutationObserver((records) => {
				for (const rec of records) {
					rec.addedNodes.forEach((n) => {
						// Skip fitWidth's own measuring clone (added and removed during a fit).
						if (!(n instanceof HTMLElement) || !n.isConnected || n.hasAttribute('data-fitwidth-probe')) return
						if (n.matches(`[${OPT_IN_ATTR}]`)) fitElement(n)
						n.querySelectorAll<HTMLElement>(`[${OPT_IN_ATTR}]`).forEach(fitElement)
					})
				}
			}).observe(document.body, { childList: true, subtree: true })
		}
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run, { once: true })
	} else {
		run()
	}
}

autoInit()

// Public browser API — assigned to window.FitWidth via the IIFE global name.
export { init, refit, destroy }
