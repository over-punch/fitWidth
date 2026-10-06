// fitWidth/src/core/types.ts — options interface for the fitWidth tool

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
	 * Default: 0.3. Note that −0.3em can squeeze glyphs into each other; lower it for body faces.
	 */
	maxTracking?: number

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
}
