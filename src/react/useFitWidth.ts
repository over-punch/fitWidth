// fitWidth/src/react/useFitWidth.ts — React hook that applies fitWidth on mount and resize

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { applyFitWidth } from '../core/adjust'
import type { FitWidthOptions } from '../core/types'

/**
 * React hook that binary-searches the wdth axis and/or letter-spacing to make
 * the ref'd element fill a target width. Re-runs on container resize and after
 * fonts finish loading. Cleans up on unmount.
 *
 * @param options - FitWidthOptions (merged with defaults inside applyFitWidth)
 * @returns A MutableRefObject to attach to the target headline element
 */
export function useFitWidth(options: FitWidthOptions = {}, refitKey?: unknown) {
	// A ref that re-renders when React attaches a different element (conditional remount, a
	// changed `as`), so the effects below move to the new element instead of keeping the old one.
	const [node, setNode] = useState<HTMLElement | null>(null)
	const ref = useMemo(() => {
		let current: HTMLElement | null = null
		return {
			get current() { return current },
			set current(el: HTMLElement | null) {
				if (el === current) return
				current = el
				setNode(el)
			},
		}
	}, [])
	const optionsRef = useRef(options)
	optionsRef.current = options

	// Track whether the hook is mounted so fire-and-forget async callbacks can bail out
	const mountedRef = useRef(true)

	// Destructure options that should trigger a re-run when they change
	const { target, prefer, axis, axisMin, axisMax, maxTracking, tolerance, respectReducedMotion, size, trimTrailingSpace } = options
	// `size` may be an inline object: compare it by value so it doesn't refit on every render.
	const sizeKey = size && typeof size === 'object' ? `${size.min},${size.max}` : size

	const run = useCallback(() => {
		const el = ref.current
		if (!el) return
		applyFitWidth(el, optionsRef.current)
	}, [target, prefer, axis, axisMin, axisMax, maxTracking, tolerance, respectReducedMotion, sizeKey, trimTrailingSpace, refitKey])

	// Keep mountedRef current alongside the component lifecycle
	useEffect(() => {
		mountedRef.current = true
		return () => {
			mountedRef.current = false
		}
	}, [])

	useLayoutEffect(() => {
		run()

		const el = node
		if (!el) return

		// Refit when the text changes (fitWidth only writes inline styles, so React's updates to the
		// text land normally; they just need a new fit). Attribute changes aren't observed, so the
		// fit's own style writes don't retrigger it.
		let moRaf = 0
		const mo = typeof MutationObserver !== 'undefined'
			? new MutationObserver(() => {
				cancelAnimationFrame(moRaf)
				moRaf = requestAnimationFrame(run)
			})
			: null
		mo?.observe(el, { childList: true, characterData: true, subtree: true })

		if (typeof ResizeObserver === 'undefined') {
			return () => { mo?.disconnect(); cancelAnimationFrame(moRaf) }
		}

		// Observe the container (parent) rather than the fitted element itself.
		// If the element exhausts its axis/tracking range it becomes shorter than the
		// container, so observing the element would miss subsequent container resizes.
		const container = el.parentElement ?? el

		let lastWidth = 0
		let rafId = 0
		const ro = new ResizeObserver((entries) => {
			// Guard: spec allows empty entries array when element is detached
			if (!entries.length) return
			const w = Math.round(entries[0].contentRect.width)
			if (w === lastWidth) return
			lastWidth = w
			cancelAnimationFrame(rafId)
			rafId = requestAnimationFrame(run)
		})
		ro.observe(container)

		return () => {
			ro.disconnect()
			mo?.disconnect()
			cancelAnimationFrame(rafId)
			cancelAnimationFrame(moRaf)
		}
	}, [run, node])

	// Re-run after fonts finish loading — measurements before font-swap produce
	// incorrect widths and the fit will be off until the real font is available.
	// Use 'loadingdone' for ongoing font-swap events (fonts.ready settles only once).
	// The fonts.ready.then path handles the initial page load.
	useEffect(() => {
		if (!document.fonts) return

		let cancelled = false

		// Initial load: fire once when fonts are ready
		document.fonts.ready.then(() => {
			if (!cancelled && mountedRef.current) run()
		}).catch(() => {})

		// Ongoing: re-run whenever additional fonts load after initial ready
		const handleLoadingDone = () => {
			if (!cancelled && mountedRef.current) run()
		}
		document.fonts.addEventListener('loadingdone', handleLoadingDone)

		return () => {
			cancelled = true
			document.fonts.removeEventListener('loadingdone', handleLoadingDone)
		}
		// Intentionally omit `run` from deps: fonts.ready is a one-time registration
		// and loadingdone should stay wired for the component lifetime without
		// re-registering on every options change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Re-evaluate when the user changes their motion preference at the OS level.
	// Only active when respectReducedMotion is true — applyFitWidth handles the
	// guard internally, so calling run() on either change direction is correct:
	// if they disable reduced-motion the fit applies; if they enable it, the early
	// return in applyFitWidth skips the fit (styles are not changed).
	useEffect(() => {
		if (!respectReducedMotion) return
		if (typeof window === 'undefined') return
		if (typeof window.matchMedia !== 'function') return

		const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handler = () => run()
		mql.addEventListener('change', handler)
		return () => mql.removeEventListener('change', handler)
	}, [respectReducedMotion, run])

	return ref
}
