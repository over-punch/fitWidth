// fitWidth/src/core/adjust.ts — framework-agnostic binary-search width fitting algorithm.
// Measurement runs through the MeasureBackend interface (from @overpunch/measure-core), so the
// same search ports to non-DOM hosts (Figma temp node, InDesign composer). The DOM path measures
// candidates on a hidden clone of the element beside it, writing the visible element only once.
// Stages: the axis, then (opt-in) font size, then letter-spacing; the result says what each did.

import type { MeasureBackend, Size, TextStyle } from '@overpunch/measure-core'
import type { FitWidthLimit, FitWidthOptions, FitWidthResult } from './types'

// ─── Saved-state registry ─────────────────────────────────────────────────────

/** Original inline styles saved before the first applyFitWidth call */
interface SavedStyles {
	/** el.style.fontVariationSettings before fitWidth wrote it (updated if the author changes it later) */
	fvs: string
	/** el.style.letterSpacing before fitWidth wrote it (updated if the author changes it later) */
	letterSpacing: string
	/** el.style.fontSize before fitWidth wrote it (only written when the `size` option is on) */
	fontSize: string
	/** el.style.marginRight before fitWidth wrote it (only written when tracking is added) */
	marginRight: string
	/** Whether the element had a style attribute at all, so removeFitWidth can leave it as found */
	hadStyleAttr: boolean
	/** The values fitWidth last wrote; a different value found later was set by the author */
	written: { fvs: string; letterSpacing: string; fontSize: string; marginRight: string } | null
}

/**
 * Per-element saved original inline styles.
 * The first call to applyFitWidth saves the originals; removeFitWidth restores them.
 * Subsequent calls to applyFitWidth reset from these saved values before re-fitting.
 */
const savedStyles = new WeakMap<HTMLElement, SavedStyles>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Defaults applied when options are omitted */
const DEFAULTS = {
	target: 'container' as const,
	prefer: 'auto' as const,
	axis: 'wdth',
	axisMin: 75,
	axisMax: 125,
	maxTracking: 0.3,
	tolerance: 0.5,
}

/** Default letter-spacing cap (em) when `size` is on: font size does the coarse fit, so tracking stays small. */
const SIZED_MAX_TRACKING = 0.05

/** Default font-size multipliers for `size: true`. */
const SIZE_RANGE = { min: 0.5, max: 2 }

/** Font-size candidates are floored to this many px, so the written value is one that was measured. */
const SIZE_STEP = 0.01

/**
 * Resolve the `size` option to a pair of font-size multipliers, or null when sizing is off or invalid.
 */
function resolveSize(size: FitWidthOptions['size']): { min: number; max: number } | null {
	if (!size) return null
	const min = size === true ? SIZE_RANGE.min : size.min ?? SIZE_RANGE.min
	const max = size === true ? SIZE_RANGE.max : size.max ?? SIZE_RANGE.max
	if (!(Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min)) {
		warnOnce('size', `[fitWidth] size needs positive multipliers with min <= max; got ${JSON.stringify(size)}. Font size left alone`)
		return null
	}
	return { min, max }
}

/**
 * Resolve the target width in pixels.
 *
 * - 'container': parent element's getBoundingClientRect().width
 * - number: used directly
 * - HTMLElement: that element's getBoundingClientRect().width
 */
function resolveTarget(el: HTMLElement, target: FitWidthOptions['target'] | null | string): number {
	if (typeof target === 'number') return target
	if (target && typeof target === 'object' && 'getBoundingClientRect' in target) return contentWidth(target)
	if (typeof target === 'string' && target !== 'container') {
		warnOnce('target:' + target, `[fitWidth] target "${target}" is not supported (use 'container', a number of px or an element); filling the container`)
	}
	// 'container', or null/undefined (e.g. a React ref that isn't attached yet)
	return el.parentElement ? contentWidth(el.parentElement) : contentWidth(el)
}

/**
 * The scale of an element's transform (1 when untransformed): getBoundingClientRect is visual,
 * offsetWidth is layout. Small differences are sub-pixel rounding, not a transform.
 */
function layoutScale(el: HTMLElement): number {
	const visual = el.getBoundingClientRect().width
	const layout = el.offsetWidth
	if (!(layout > 0) || !(visual > 0) || Math.abs(visual - layout) <= 1) return 1
	return visual / layout
}

/** An element's content-box width in layout px (sub-pixel): text can't use padding, borders or a transform's scale. */
function contentWidth(el: HTMLElement): number {
	const cs = getComputedStyle(el)
	const px = (v: string) => parseFloat(v) || 0
	return el.getBoundingClientRect().width / layoutScale(el)
		- px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth)
}

/** Warnings already printed, so a repeated refit warns once. */
const _warned = new Set<string>()

/** Prints a console warning the first time it is seen. */
function warnOnce(key: string, message: string): void {
	if (_warned.has(key)) return
	_warned.add(key)
	console.warn(message)
}

/**
 * Measures the element as it renders: a hidden clone placed beside it in the same parent, so it
 * inherits the same styles, markup, author spacing and transform. Only the candidate
 * font-variation-settings and letter-spacing change between measurements.
 */
class CloneMeasureBackend implements MeasureBackend {
	readonly caps = { continuousAxis: true, glyphInk: false }
	/** The hidden clone. */
	private clone: HTMLElement
	/** Transform scale of the parent, so widths come back in layout px. */
	private scale: number
	/** The clone's own inline font-size (the author's), restored when a trial has no fontSize. */
	private inlineFontSize: string

	/**
	 * @param el          - The element to fit
	 * @param baseSpacing - The author's letter-spacing (CSS length) that tracking is added to
	 */
	constructor(el: HTMLElement, private baseSpacing: string) {
		const clone = el.cloneNode(true) as HTMLElement
		clone.removeAttribute('id')
		clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'))
		clone.setAttribute('aria-hidden', 'true')
		clone.setAttribute('data-fitwidth-probe', '')
		const ws = getComputedStyle(el).whiteSpace
		Object.assign(clone.style, {
			position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: '0', top: '0',
			display: 'inline-block', width: 'max-content', minWidth: '0', maxWidth: 'none', margin: '0',
			transition: 'none', animation: 'none',
			// Fit one line: normal wrapping becomes nowrap; preserved whitespace stays preserved.
			whiteSpace: ws === 'pre-wrap' || ws === 'break-spaces' ? 'pre' : ws === 'pre' || ws === 'pre-line' ? ws : 'nowrap',
		} as Partial<CSSStyleDeclaration>)
		el.insertAdjacentElement('afterend', clone)
		this.clone = clone
		this.inlineFontSize = clone.style.fontSize
		this.scale = el.parentElement ? layoutScale(el.parentElement) : 1
	}

	/**
	 * Width of the element (border box, layout px) with the trial style; `text` is the element's own.
	 * Browsers add letter-spacing after the last letter too. That trailing space is not part of the
	 * text, so the tracking the fit adds is taken off the width once: the fit then lands the last
	 * letter on the target, not the empty space after it.
	 */
	measureText(_text: string, style: TextStyle): Size {
		this.clone.style.fontVariationSettings = style.fontVariationSettings ?? ''
		this.clone.style.fontSize = style.fontSize ? `${style.fontSize}px` : this.inlineFontSize
		this.clone.style.letterSpacing = style.letterSpacing ? `calc(${this.baseSpacing} + ${style.letterSpacing}px)` : this.baseSpacing
		const rect = this.clone.getBoundingClientRect()
		return { width: rect.width / this.scale - (style.letterSpacing ?? 0), height: rect.height / this.scale }
	}

	/** Removes the clone. */
	dispose(): void {
		this.clone.remove()
	}
}

/**
 * Escape a string for literal use inside a RegExp.
 * Replaces all regex metacharacters with their escaped equivalents.
 */
function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Build a RegExp matching a single axis value inside a font-variation-settings string.
 * Pre-compiled once per call for reuse across all binary-search iterations.
 */
function makeAxisPattern(axis: string): RegExp {
	// Use hyphen-first in character class so it is treated as a literal, not a range.
	return new RegExp(`(["'])${escapeRegExp(axis)}\\1\\s+[-\\d.eE+]+`)
}

/**
 * Override a single axis value inside a font-variation-settings string, preserving
 * all other axis values. Adds the axis if not already present.
 *
 * e.g. overrideAxis('"wght" 300, "opsz" 18', 'wdth', 90) → '"wght" 300, "opsz" 18, "wdth" 90'
 */
function overrideAxis(baseFVS: string, axis: string, value: number, pattern: RegExp): string {
	if (!baseFVS || baseFVS === 'normal') return `"${axis}" ${value}`
	const replacement = `"${axis}" ${value}`
	return pattern.test(baseFVS)
		? baseFVS.replace(pattern, replacement)
		: `${baseFVS}, ${replacement}`
}

/**
 * Whether a candidate's gap (measured − target, px) beats the best so far. A fit (gap ≤ 0) always
 * beats an overflow, and the fit closest to the target wins: the text must never end up wider than
 * its container, or a heading without nowrap wraps onto a second line.
 */
function isBetter(gap: number, best: number): boolean {
	if (!Number.isFinite(best)) return true
	if (gap <= 0 && best > 0) return true
	if (gap > 0 && best <= 0) return false
	return Math.abs(gap) < Math.abs(best)
}

/**
 * Binary search the width axis to fit the measured text width to targetWidth.
 * Measures each candidate via backend.measureText — never mutates the live element.
 * Returns the best axis value, its gap from target, and the winning fvs string.
 */
function searchAxis(
	backend: MeasureBackend,
	text: string,
	baseFVS: string,
	axis: string,
	axisPattern: RegExp,
	axisMin: number,
	axisMax: number,
	tolerance: number,
	targetWidth: number,
	maxIterations = 20,
): { value: number; gap: number; fvs: string; inert?: boolean } {
	// Degenerate range — return the single value without looping.
	if (axisMin >= axisMax) {
		const fvs = overrideAxis(baseFVS, axis, axisMin, axisPattern)
		const measured = backend.measureText(text, { fontVariationSettings: fvs }).width
		console.warn(`[fitWidth] axisMin (${axisMin}) >= axisMax (${axisMax}); using ${axisMin}`)
		return { value: axisMin, gap: measured - targetWidth, fvs }
	}

	let lo = axisMin
	let hi = axisMax
	let bestValue = (lo + hi) / 2
	let bestGap = Infinity
	let bestFVS = overrideAxis(baseFVS, axis, bestValue, axisPattern)
	let widestWidth = NaN

	// Try the ends first: if even the widest value is too narrow (or the narrowest too wide), the
	// answer is that end, without spending iterations on the middle.
	for (let i = 0; i < maxIterations + 2; i++) {
		const mid = i === 0 ? axisMax : i === 1 ? axisMin : (lo + hi) / 2
		const fvs = overrideAxis(baseFVS, axis, mid, axisPattern)
		const measured = backend.measureText(text, { fontVariationSettings: fvs }).width
		const gap = measured - targetWidth

		if (isBetter(gap, bestGap)) {
			bestValue = mid
			bestGap = gap
			bestFVS = fvs
		}

		if (i === 0) widestWidth = measured
		if (i === 0 && gap <= 0) {
			// Widest value still fits: use it. One more measurement tells a short range from an axis
			// the font doesn't have (the narrow end measures the same).
			const narrow = backend.measureText(text, { fontVariationSettings: overrideAxis(baseFVS, axis, axisMin, axisPattern) }).width
			if (Math.abs(narrow - measured) < 0.01) return { value: bestValue, gap: bestGap, fvs: bestFVS, inert: true }
			break
		}
		if (i === 1) {
			// The axis doesn't change the width at all: the font doesn't have it (or it's static).
			if (Math.abs(measured - widestWidth) < 0.01) return { value: bestValue, gap: bestGap, fvs: bestFVS, inert: true }
			if (gap > 0) break // narrowest value still overflows: use it
			continue
		}
		// Done when the text fits and is within tolerance of the target (never wider than it).
		if (gap <= 0 && gap >= -tolerance) break

		// Higher axis value → wider text (assumes a standard width-expanding axis like wdth)
		if (gap < 0) lo = mid  // too narrow — increase axis value
		else hi = mid          // too wide — decrease axis value
	}

	return { value: bestValue, gap: bestGap, fvs: bestFVS }
}

/**
 * Binary search letter-spacing (in em) to close a remaining width gap.
 * Measures each candidate via backend.measureText. Clamps to ±maxTracking em.
 * Returns the best em value and its gap from target.
 */
function searchTracking(
	backend: MeasureBackend,
	text: string,
	fvs: string,
	fontSizePx: number,
	maxTracking: number,
	tolerance: number,
	targetWidth: number,
	maxIterations = 20,
	sizedPx?: number,
): { value: number; gap: number } {
	// Without a positive font size we cannot convert em → px — leave tracking at 0.
	if (!(fontSizePx > 0)) {
		const measured = backend.measureText(text, { fontVariationSettings: fvs, letterSpacing: 0, fontSize: sizedPx }).width
		return { value: 0, gap: measured - targetWidth }
	}

	let lo = -maxTracking
	let hi = maxTracking
	let bestValue = 0
	let bestGap = Infinity

	for (let i = 0; i < maxIterations; i++) {
		const mid = (lo + hi) / 2  // em
		const measured = backend.measureText(text, {
			fontVariationSettings: fvs,
			letterSpacing: mid * fontSizePx,  // em → px
			fontSize: sizedPx,
		}).width
		const gap = measured - targetWidth

		if (isBetter(gap, bestGap)) {
			bestValue = mid
			bestGap = gap
		}

		// Done when the text fits and is within tolerance of the target (never wider than it).
		if (gap <= 0 && gap >= -tolerance) break

		// Higher letter-spacing → wider text
		if (gap < 0) lo = mid
		else hi = mid
	}

	return { value: bestValue, gap: bestGap }
}

/**
 * Binary search the font size (px) to close a width gap the axis couldn't.
 * Tries the ends first: if the largest size still falls short (or the smallest still overflows),
 * that end is the answer. Candidates are floored to SIZE_STEP px so the returned value was measured.
 */
function searchSize(
	backend: MeasureBackend,
	text: string,
	fvs: string,
	minPx: number,
	maxPx: number,
	tolerance: number,
	targetWidth: number,
	maxIterations = 20,
): { value: number; gap: number; limit: FitWidthLimit } {
	const quantize = (v: number) => Math.max(SIZE_STEP, Math.floor(v / SIZE_STEP) * SIZE_STEP)
	const gapAt = (px: number) => backend.measureText(text, { fontVariationSettings: fvs, fontSize: px }).width - targetWidth

	const hi0 = quantize(maxPx)
	const hiGap = gapAt(hi0)
	if (hiGap <= 0) return { value: hi0, gap: hiGap, limit: 'max' } // largest size still fits: use it
	const lo0 = quantize(minPx)
	const loGap = gapAt(lo0)
	if (loGap > 0) return { value: lo0, gap: loGap, limit: 'min' } // smallest size still overflows: use it

	let lo = lo0
	let hi = hi0
	let bestValue = lo0
	let bestGap = loGap
	for (let i = 0; i < maxIterations; i++) {
		if (bestGap <= 0 && bestGap >= -tolerance) break
		const mid = quantize((lo + hi) / 2)
		if (mid <= lo) break // out of font-size resolution
		const gap = gapAt(mid)
		if (isBetter(gap, bestGap)) {
			bestValue = mid
			bestGap = gap
		}
		// Larger font size → wider text
		if (gap < 0) lo = mid
		else hi = mid
	}
	return { value: bestValue, gap: bestGap, limit: null }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fit a single-line display element to a target width by binary-searching the width variable font
 * axis, then (only with the `size` option) font size, then letter-spacing.
 *
 * Does NOT wrap content in spans or rewrite innerHTML — only sets
 * el.style.fontVariationSettings, el.style.letterSpacing (with a matching el.style.marginRight that
 * cancels the space browsers add after the last letter) and, with `size`, el.style.fontSize,
 * once, after the search.
 *
 * Calling applyFitWidth multiple times is idempotent: original styles are saved
 * on the first call and reset internally before each re-fit.
 *
 * @param el      - Single-line display element (headline, pull-quote, masthead)
 * @param options - FitWidthOptions (merged with defaults)
 * @returns What the fit did (widths, the value each stage ended on, and whether the text fits),
 *          or null when nothing was fitted (no window, empty text, invalid options, reduced motion).
 */
export function applyFitWidth(el: HTMLElement, options: FitWidthOptions = {}): FitWidthResult | null {
	if (typeof window === 'undefined') return null

	// Honour prefers-reduced-motion: skip the fit if the user has requested it
	if (
		options.respectReducedMotion &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	) return null

	// Save scroll position — iOS Safari ignores overflow-anchor: none
	const scrollY = window.scrollY

	// Resolve options against defaults
	const prefer = options.prefer ?? DEFAULTS.prefer
	const axis = options.axis ?? DEFAULTS.axis
	const axisMin = options.axisMin ?? DEFAULTS.axisMin
	const axisMax = options.axisMax ?? DEFAULTS.axisMax
	const sizeRange = resolveSize(options.size)
	const maxTracking = options.maxTracking ?? (sizeRange ? SIZED_MAX_TRACKING : DEFAULTS.maxTracking)
	const rawTolerance = options.tolerance ?? DEFAULTS.tolerance
	const tolerance = Number.isFinite(rawTolerance) && rawTolerance >= 0 ? rawTolerance : DEFAULTS.tolerance
	if (tolerance !== rawTolerance) warnOnce('tolerance', `[fitWidth] tolerance must be a non-negative number; got ${rawTolerance}, using ${DEFAULTS.tolerance}`)
	if (typeof axis !== 'string' || !/^[A-Za-z0-9 ]{4}$/.test(axis)) {
		console.warn(`[fitWidth] axis must be a four-character tag such as 'wdth'; got ${JSON.stringify(axis)}`)
		return null
	}
	if (typeof options.target === 'number' && !(Number.isFinite(options.target) && options.target > 0)) {
		console.warn(`[fitWidth] target must be a positive number of px; got ${options.target}`)
		return null
	}

	// Validate numeric options — guard against NaN/Infinity/swapped ranges
	if (!isFinite(axisMin) || !isFinite(axisMax)) {
		console.warn(`[fitWidth] axisMin and axisMax must be finite numbers; got ${axisMin}, ${axisMax}`)
		return null
	}
	if (!isFinite(maxTracking) || maxTracking < 0) {
		console.warn(`[fitWidth] maxTracking must be a finite non-negative number; got ${maxTracking}`)
		return null
	}

	// Pre-compile the axis regex pattern once for this call
	const axisPattern = makeAxisPattern(axis)

	// Nothing to fit: leave the element untouched.
	if (!(el.textContent ?? '').trim()) return null

	// Save original inline styles on first call (idempotent for subsequent calls)
	if (!savedStyles.has(el)) {
		savedStyles.set(el, {
			fvs: el.style.fontVariationSettings,
			letterSpacing: el.style.letterSpacing,
			fontSize: el.style.fontSize,
			marginRight: el.style.marginRight,
			hadStyleAttr: el.hasAttribute('style'),
			written: null,
		})
	}

	// Reset to saved originals before re-fitting (makes repeated calls idempotent). A value that
	// differs from what fitWidth last wrote was set since by the author (or a framework re-render):
	// it becomes the new original instead of being wiped.
	const saved = savedStyles.get(el)!
	if (saved.written) {
		if (el.style.fontVariationSettings !== saved.written.fvs) saved.fvs = el.style.fontVariationSettings
		if (el.style.letterSpacing !== saved.written.letterSpacing) saved.letterSpacing = el.style.letterSpacing
		if (el.style.fontSize !== saved.written.fontSize) saved.fontSize = el.style.fontSize
		if (el.style.marginRight !== saved.written.marginRight) saved.marginRight = el.style.marginRight
	}
	el.style.fontVariationSettings = saved.fvs
	el.style.letterSpacing = saved.letterSpacing
	if (el.style.fontSize !== saved.fontSize) el.style.fontSize = saved.fontSize
	if (el.style.marginRight !== saved.marginRight) el.style.marginRight = saved.marginRight

	// Resolve target width (read AFTER reset so parent geometry is stable)
	const targetWidth = resolveTarget(el, options.target)
	if (targetWidth <= 0) return null

	// Batch computed-style reads before the search
	const cs = getComputedStyle(el)
	const baseFVS = cs.fontVariationSettings
	const fontSize = parseFloat(cs.fontSize)
	const text = el.textContent ?? ''
	// Tracking is added to the author's letter-spacing rather than replacing it. When font size can
	// change, the author's spacing is carried in em so it scales with the fitted size.
	const basePx = !cs.letterSpacing || cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0
	// The author's own right margin (px), which the trailing-space correction is added to.
	const baseMargin = parseFloat(cs.marginRight) || 0
	const sizing = !!sizeRange && fontSize > 0
	const baseSpacing = basePx === 0
		? '0px'
		: sizing ? `${+(basePx / fontSize).toFixed(5)}em` : cs.letterSpacing
	const spacing = (em: number) => (baseSpacing === '0px' ? `${em}em` : `calc(${baseSpacing} + ${em}em)`)

	// Measure candidates on a hidden clone of this element, so the visible element is written
	// only once (no search-time flicker/thrash).
	const backend = new CloneMeasureBackend(el, baseSpacing)
	const inRange = (gap: number) => gap <= 0 && gap >= -tolerance
	let finalGap = 0
	let natural = 0
	let fvs = baseFVS
	let axisValue: number | null = null
	let sizePx = fontSize
	let tracking = 0
	let afterAxis = 0
	let afterSize = 0
	const limits: FitWidthResult['limits'] = { axis: null, size: null, tracking: null }
	try {
		natural = backend.measureText(text, { fontVariationSettings: baseFVS }).width
		finalGap = natural - targetWidth

		// Stage 1 — the axis, at the size the author set (skipped for prefer: 'tracking')
		if (prefer !== 'tracking') {
			const a = searchAxis(backend, text, baseFVS, axis, axisPattern, axisMin, axisMax, tolerance, targetWidth)
			if (a.inert && prefer === 'axis' && !sizing) warnOnce('inert:' + axis, `[fitWidth] the "${axis}" axis doesn't change this font's width (the font may not have it); prefer: 'axis' can't fit the text`)
			fvs = a.fvs
			axisValue = a.value
			finalGap = a.gap
			limits.axis = a.inert ? 'inert' : inRange(a.gap) ? null : a.value <= axisMin ? 'min' : a.value >= axisMax ? 'max' : null
			el.style.fontVariationSettings = fvs
		}
		afterAxis = finalGap + targetWidth

		// Stage 2 — font size, only with the `size` option and only if the axis couldn't reach the target
		if (sizing && sizeRange && !inRange(finalGap)) {
			const s = searchSize(backend, text, fvs, fontSize * sizeRange.min, fontSize * sizeRange.max, tolerance, targetWidth)
			sizePx = s.value
			finalGap = s.gap
			limits.size = inRange(s.gap) ? null : s.limit
		}
		afterSize = finalGap + targetWidth
		const sized = sizePx !== fontSize ? sizePx : undefined

		// Stage 3 — letter-spacing closes what is left (skipped for prefer: 'axis')
		// (prefer: 'tracking' without `size` always searches, as it did before the size stage existed.)
		if (prefer !== 'axis' && (!inRange(finalGap) || (prefer === 'tracking' && !sizing))) {
			const t = searchTracking(backend, text, fvs, sizePx, maxTracking, tolerance, targetWidth, 20, sized)
			tracking = t.value
			finalGap = t.gap
			// Not on target and not at the cap either: the width jumps past the target between two
			// neighbouring values (any letter-spacing turns a font's ligatures off), so none lands on it.
			limits.tracking = inRange(t.gap) ? null : Math.abs(t.value) < maxTracking * 0.999 ? 'stepped' : t.value < 0 ? 'min' : 'max'
			el.style.letterSpacing = spacing(t.value)
			// Cancel the space the browser adds after the last letter, so the element's box ends where
			// its last letter does (and negative tracking doesn't leave the last letter outside the box).
			if (t.value !== 0) el.style.marginRight = baseMargin === 0 ? `${-t.value}em` : `calc(${baseMargin}px + ${-t.value}em)`
		} else if (sized !== undefined && baseSpacing !== '0px') {
			// The clone was measured with the author's spacing in em: write the same on the element.
			el.style.letterSpacing = baseSpacing
		}
		if (sized !== undefined) el.style.fontSize = `${+sized.toFixed(2)}px`
	} finally {
		backend.dispose()
	}
	saved.written = { fvs: el.style.fontVariationSettings, letterSpacing: el.style.letterSpacing, fontSize: el.style.fontSize, marginRight: el.style.marginRight }
	if (finalGap > 0.5) {
		// Name only the levers this call was allowed to use. Printed once per combination of levers.
		const used = [prefer !== 'tracking' ? `the ${axis} range (axisMin/axisMax)` : '', sizing ? 'the size range' : '', prefer !== 'axis' ? 'maxTracking' : ''].filter(Boolean)
		warnOnce(`overflow:${prefer}:${sizing}`, `[fitWidth] the text is still ${finalGap.toFixed(1)}px wider than its target with ${used.join(', ')} used up. Widen ${used.length > 1 ? 'one of them' : 'it'}${sizing ? '' : ', or turn on size'}. (This warning is printed once; the returned result reports every fit.)`)
	}

	// Restore scroll after style mutations
	requestAnimationFrame(() => {
		if (Math.abs(window.scrollY - scrollY) > 2) {
			window.scrollTo({ top: scrollY, behavior: 'instant' })
		}
	})

	const width = finalGap + targetWidth
	const ratio = (after: number, before: number) => (before > 0 && after > 0 ? after / before : 1)
	const result: FitWidthResult = {
		target: targetWidth,
		natural,
		width,
		gap: finalGap,
		// 'fit' means never wider than the target: anything over it (beyond float noise) is an overflow.
		status: finalGap > 0.01 ? 'overflow' : finalGap < -tolerance - 0.01 ? 'short' : 'fit',
		axis: prefer === 'tracking' ? null : axis,
		axisValue,
		fontSize: sizePx,
		tracking,
		ratios: { axis: ratio(afterAxis, natural), size: ratio(afterSize, afterAxis), tracking: ratio(width, afterSize) },
		limits,
	}
	options.onFit?.(result)
	return result
}

/**
 * Remove fitWidth styles and restore the element to its original inline styles.
 * No-op if applyFitWidth was never called on this element.
 *
 * @param el - The element previously adjusted by applyFitWidth
 */
export function removeFitWidth(el: HTMLElement): void {
	const saved = savedStyles.get(el)
	if (!saved) return
	el.style.fontVariationSettings = saved.fvs
	el.style.letterSpacing = saved.letterSpacing
	if (el.style.fontSize !== saved.fontSize) el.style.fontSize = saved.fontSize
	if (el.style.marginRight !== saved.marginRight) el.style.marginRight = saved.marginRight
	// Leave no empty style="" behind on an element that had no style attribute.
	if (!saved.hadStyleAttr && !el.getAttribute('style')) el.removeAttribute('style')
	savedStyles.delete(el)
}
