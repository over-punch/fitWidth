// fitWidth/src/core/types.ts — options and result interfaces for the fitWidth tool

/** Options controlling the fitWidth effect */
export interface FitWidthOptions {
	/**
	 * Target width to fill. Default: 'container'
	 *
	 * - **'container'** — fill the parent element's getBoundingClientRect().width (sub-pixel float, transform-aware)
	 * - **number** — exact pixel target
	 * - **HTMLElement** — match the content width of another element
	 *
	 * 'container' and an element use the content box (padding and borders excluded) in layout px,
	 * so a transformed (scaled) parent works too. `null` (a React ref not yet attached) means 'container'.
	 */
	target?: 'container' | number | HTMLElement | null

	/**
	 * Which strategy to use. Default: 'auto'
	 *
	 * - **'auto'** — try the wdth axis first (if available), fall back to letter-spacing
	 * - **'axis'** — wdth axis only (no tracking added; the author's own letter-spacing is kept)
	 * - **'tracking'** — letter-spacing only (font-variation-settings left unchanged)
	 */
	prefer?: 'auto' | 'axis' | 'tracking'

	/**
	 * Variable font axis tag to adjust when prefer is 'auto' or 'axis'. Default: 'wdth'
	 */
	axis?: string

	/** Minimum axis value for the binary search. Default: 75 */
	axisMin?: number

	/** Maximum axis value for the binary search. Default: 125 */
	axisMax?: number

	/**
	 * Maximum absolute letter-spacing in em added on top of the author's own (clamped to ±this value).
	 * Default: 0.3, or 0.05 when `size` is on (font size then does the coarse fit, so tracking only
	 * closes a small remainder). Note that −0.3em can squeeze glyphs into each other; lower it for body faces.
	 */
	maxTracking?: number

	/**
	 * Let font size take over when the axis range runs out. Default: false (font size is never changed).
	 *
	 * - **true** — font size may go from 0.5× to 2× the element's own size
	 * - **{ min, max }** — the same, with your own multipliers (min ≤ 1 ≤ max is usual, e.g. `{ min: 0.6, max: 1.5 }`)
	 *
	 * The order is: the axis first, at the size you set; then font size, only if the axis range can't
	 * reach the target; then letter-spacing, only if font size hits its limit. The fit writes
	 * `font-size` inline (in px) and `removeFitWidth` restores it. A changed font size changes the
	 * element's height, so leave room for it.
	 */
	size?: boolean | { min?: number; max?: number }

	/**
	 * Convergence tolerance in pixels. The fitted text is never wider than the target and at most
	 * this much narrower. Default: 0.5
	 */
	tolerance?: number

	/**
	 * When true, checks window.matchMedia('(prefers-reduced-motion: reduce)') before fitting.
	 * If the user has requested reduced motion, applyFitWidth returns early without modifying
	 * letter-spacing or font-variation-settings. Default: false.
	 */
	respectReducedMotion?: boolean

	/**
	 * Called after every fit with what the fit did (the same object `applyFitWidth` returns).
	 * Use it to log or display how much of the fit came from the axis, font size and tracking.
	 */
	onFit?: (result: FitWidthResult) => void
}

/** Where a stage of the fit ended: at an end of its range, or null when it stopped inside it. */
export type FitWidthLimit = 'min' | 'max' | null

/** What one fit did. Widths are in layout px; ratios are width multipliers. */
export interface FitWidthResult {
	/** The target width */
	target: number
	/** The text's width as authored, before any fitting */
	natural: number
	/**
	 * The text's width after the fit. Letter-spacing the fit added is counted between letters only:
	 * the space browsers add after the last letter is left out (and cancelled with a right margin),
	 * so this is where the last letter ends.
	 */
	width: number
	/** width − target: 0 to −tolerance when the text fits; more negative when it falls short; positive when it overflows */
	gap: number
	/**
	 * - **'fit'** — within tolerance of the target (never wider)
	 * - **'short'** — every enabled range ran out before the text reached the target
	 * - **'overflow'** — every enabled range ran out and the text is still wider than the target
	 */
	status: 'fit' | 'short' | 'overflow'
	/** The axis tag searched, or null when the axis wasn't used (`prefer: 'tracking'`) */
	axis: string | null
	/** The axis value written, or null when the axis wasn't used */
	axisValue: number | null
	/** The font size after the fit, in px (the element's own size when `size` is off) */
	fontSize: number
	/** Letter-spacing added by the fit, in em (0 when none was added) */
	tracking: number
	/**
	 * The width multiplier each stage contributed. Their product is `width / natural`.
	 * A value of 1 means the stage did nothing.
	 */
	ratios: { axis: number; size: number; tracking: number }
	/**
	 * Where each stage ended. `axis` is 'inert' when the axis doesn't change this text's width
	 * (the font doesn't have it, or the characters come from a fallback font). `tracking` is 'stepped' when no letter-spacing value lands on the
	 * target: any non-zero letter-spacing turns a font's ligatures off, which jumps the width, and a
	 * target inside that jump can't be reached by tracking. `tracking` is 'inert' when letter-spacing
	 * doesn't change this text's width at all (a single letter has no gaps to space). A stage that
	 * wasn't used is null.
	 */
	limits: { axis: FitWidthLimit | 'inert'; size: FitWidthLimit; tracking: FitWidthLimit | 'stepped' | 'inert' }
}
