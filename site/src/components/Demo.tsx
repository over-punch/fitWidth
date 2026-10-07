"use client"

// Interactive demo: one headline in one box, fitted four ways, with a ruler of how far each lever
// reaches and a per-row breakdown (wdth, font size, tracking) taken from applyFitWidth's result.
import { useState, useEffect, useCallback, useRef } from "react"
import { useMediaQuery, useClientValue } from "@/lib/clientValue"
import { applyFitWidth } from "@overpunch/fitwidth"
import type { FitWidthOptions, FitWidthResult } from "@overpunch/fitwidth"

/** A demo font: its CSS family and the wdth range the font file really has (null: no wdth axis). */
interface DemoFont {
	/** Stable id for React keys and the select */
	id: string
	/** Name shown in the picker */
	label: string
	/** CSS font-family value */
	family: string
	/** The font's own wdth axis range from its fvar table, or null when it has no wdth axis */
	wdth: [number, number] | null
	/** One line on what this font is here to show */
	note: string
}

/** The demo fonts. wdth ranges were read from each file's fvar table (fontTools, 2026-10-07). */
const FONTS: DemoFont[] = [
	{ id: 'roboto-flex', label: 'Roboto Flex', family: "'Roboto Flex', sans-serif", wdth: [25, 151], note: 'A wide axis (25–151) that also has an optical-size axis, so its reach changes with font size.' },
	{ id: 'roboto', label: 'Roboto', family: "'FW Roboto', sans-serif", wdth: [75, 100], note: 'Narrows only (75–100): it has no width above normal.' },
	{ id: 'merriweather', label: 'Merriweather', family: "'Merriweather', serif", wdth: [87, 112], note: 'A small range (87–112).' },
	{ id: 'anybody', label: 'Anybody', family: "'FW Anybody', sans-serif", wdth: [50, 150], note: 'Drawn across a wide range (50–150). Try “Font’s full range” below.' },
	{ id: 'inter', label: 'Inter (no wdth axis)', family: 'var(--font-sans), sans-serif', wdth: null, note: 'No wdth axis: the axis stage does nothing.' },
]

/** fitWidth's default wdth search range. */
const DEFAULT_RANGE: [number, number] = [75, 125]

/** fitWidth's default letter-spacing cap in em (without `size`). */
const DEFAULT_TRACKING = 0.3

/** fitWidth's letter-spacing cap in em when `size` is on. */
const SIZED_TRACKING = 0.05

/** fitWidth's font-size multipliers for `size: true`. */
const SIZE_RANGE: [number, number] = [0.5, 2]

/** Headline presets offered beside the text field. */
const PRESETS = ['Typography', 'Display Type', 'Headline', 'MINIMUM']

/** One of the four strategies shown side by side. */
interface Strategy {
	/** Stable id */
	id: string
	/** Short name */
	label: string
	/** The option that selects it, shown as code */
	code: string
	/** What it is allowed to change */
	allows: string
	/** Options passed to applyFitWidth (the axis range is added per font) */
	options: FitWidthOptions
	/** True for the strategy that needs the unreleased `size` option */
	next?: boolean
}

/** The four strategies, in the order they are shown. */
const STRATEGIES: Strategy[] = [
	{ id: 'axis', label: 'Width axis only', code: "prefer: 'axis'", allows: 'May change: wdth.', options: { prefer: 'axis' } },
	{ id: 'tracking', label: 'Tracking only', code: "prefer: 'tracking'", allows: `May change: letter-spacing, up to ±${DEFAULT_TRACKING}em.`, options: { prefer: 'tracking' } },
	{ id: 'auto', label: 'Width axis, then tracking', code: "prefer: 'auto' (the default)", allows: `May change: wdth first, then letter-spacing up to ±${DEFAULT_TRACKING}em.`, options: { prefer: 'auto' } },
	{ id: 'size', label: 'Width axis, then font size, then a little tracking', code: 'size: true', allows: `May change: wdth first, then font size from ${SIZE_RANGE[0]}× to ${SIZE_RANGE[1]}×, then letter-spacing up to ±${SIZED_TRACKING}em.`, options: { prefer: 'auto', size: true }, next: true },
]

/** Widths (px) the levers can reach for the current headline, measured in this browser. */
interface Reach {
	/** Width as set: wdth at the font's normal, the chosen font size, no added spacing */
	natural: number
	/** Narrowest and widest the wdth search range gives on its own */
	axis: [number, number]
	/** The same with ±0.3em of tracking added at each end */
	tracking: [number, number]
	/** The same with font size 0.5×–2× and ±0.05em tracking at each end */
	size: [number, number]
}

/** Cursor icon SVG */
function CursorIcon() {
	return (
		<svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden>
			<path d="M0 0L0 11L3 8L5 13L6.8 12.3L4.8 7.3L8.5 7.3Z" />
		</svg>
	)
}

/** Gyroscope icon SVG — circle with rotation arrow */
function GyroIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
			<circle cx="7" cy="7" r="5.5" />
			<circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
			<path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" strokeWidth="1.4" />
			<path d="M11.5 5.5 L12.5 7 L13.8 6" strokeWidth="1.2" />
		</svg>
	)
}

/** Formats a width multiplier, e.g. 1.2 → "×1.20". */
function times(r: number): string {
	return `×${r.toFixed(2)}`
}

/** Formats a width in px to one decimal. */
function px(n: number): string {
	return `${n.toFixed(1)} px`
}

/** Formats a width as a percentage of the natural width. */
function pct(n: number, natural: number): string {
	return natural > 0 ? `${Math.round((n / natural) * 100)}%` : '—'
}

/**
 * The wdth range the demo asks fitWidth to search: the library default (75–125) or the font's whole
 * range, never wider than the font really has, so the value shown is one the font can render.
 */
function searchRange(font: DemoFont, fullRange: boolean): [number, number] {
	if (!font.wdth) return DEFAULT_RANGE
	if (fullRange) return font.wdth
	return [Math.max(DEFAULT_RANGE[0], font.wdth[0]), Math.min(DEFAULT_RANGE[1], font.wdth[1])]
}

/**
 * Measures how far each lever reaches for this text, with a hidden probe laid out like the rows.
 * These are plain browser measurements (getBoundingClientRect), independent of the library.
 */
function measureReach(probe: HTMLElement, range: [number, number], hasAxis: boolean, fontSize: number): Reach {
	const width = (wdth: number | null, size: number, spacingEm: number) => {
		probe.style.fontVariationSettings = wdth === null ? '' : `"wdth" ${wdth}`
		probe.style.fontSize = `${size}px`
		probe.style.letterSpacing = spacingEm ? `${spacingEm}em` : ''
		return probe.getBoundingClientRect().width
	}
	const lo = hasAxis ? range[0] : null
	const hi = hasAxis ? range[1] : null
	return {
		natural: width(null, fontSize, 0),
		axis: [width(lo, fontSize, 0), width(hi, fontSize, 0)],
		tracking: [width(lo, fontSize, -DEFAULT_TRACKING), width(hi, fontSize, DEFAULT_TRACKING)],
		size: [width(lo, fontSize * SIZE_RANGE[0], -SIZED_TRACKING), width(hi, fontSize * SIZE_RANGE[1], SIZED_TRACKING)],
	}
}

/** One labelled figure in a row's breakdown. */
function Figure({ name, value, factor, note }: { name: string; value: string; factor?: string; note?: string }) {
	return (
		<div className="flex flex-col gap-0.5 min-w-[7.5rem]">
			<dt className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{name}</dt>
			<dd className="font-mono tabular-nums text-xs">
				{value}{factor && <span className="text-muted"> {factor}</span>}
			</dd>
			{note && <dd className="text-[0.7rem] text-muted">{note}</dd>}
		</div>
	)
}

/** Plain-words verdict for a fit result. */
function verdict(r: FitWidthResult): string {
	if (r.status === 'fit') return `Fits: ${px(r.width)} in a ${px(r.target)} box.`
	// No letter-spacing value lands on the target: any spacing splits this font's ligatures, which jumps the width.
	const why = r.limits.tracking === 'stepped'
		? 'Tracking can’t land on this width: any letter-spacing turns off the font’s ligatures, and the width jumps past the box.'
		: 'Every range it may use has run out.'
	if (r.status === 'short') return `Falls ${px(-r.gap)} short: ${px(r.width)} in a ${px(r.target)} box. ${why}`
	return `Overflows by ${px(r.gap)}: ${px(r.width)} in a ${px(r.target)} box. ${why}`
}

/**
 * One strategy: the headline in its box, fitted with that strategy's options, and what the fit did.
 * The fit runs in a frame callback and stores applyFitWidth's result for the readout.
 */
function StrategyRow({ strategy, text, font, rangeMin, rangeMax, fontSize, boxPct, layoutKey }: {
	strategy: Strategy
	text: string
	font: DemoFont
	rangeMin: number
	rangeMax: number
	fontSize: number
	boxPct: number
	layoutKey: string
}) {
	const elRef = useRef<HTMLParagraphElement>(null)
	const [result, setResult] = useState<FitWidthResult | null>(null)

	useEffect(() => {
		const el = elRef.current
		if (!el) return
		const id = requestAnimationFrame(() => {
			// applyFitWidth resets to the element's own styles before every fit, so a changed font,
			// size, text or box is measured from scratch.
			setResult(applyFitWidth(el, { ...strategy.options, target: 'container', axisMin: rangeMin, axisMax: rangeMax }))
		})
		return () => cancelAnimationFrame(id)
	}, [strategy, text, font, rangeMin, rangeMax, fontSize, boxPct, layoutKey])

	const r = result
	const usesAxis = strategy.options.prefer !== 'tracking'
	const usesTracking = strategy.options.prefer !== 'axis'
	const usesSize = !!strategy.options.size
	const axisNote = !r ? undefined
		: r.limits.axis === 'inert' ? 'this font has no wdth axis'
		: r.limits.axis === 'max' ? 'widest value searched'
		: r.limits.axis === 'min' ? 'narrowest value searched'
		: undefined
	const sizeNote = !r ? undefined : r.limits.size === 'max' ? `the ${SIZE_RANGE[1]}× limit` : r.limits.size === 'min' ? `the ${SIZE_RANGE[0]}× limit` : undefined
	const trackingNote = !r ? undefined : r.limits.tracking === 'stepped' ? 'no value lands on the box' : r.limits.tracking ? 'at its cap' : undefined

	return (
		<div className="flex flex-col gap-2" data-strategy={strategy.id} data-status={r?.status ?? 'pending'}>
			<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
				<h3 className="text-sm font-semibold">{strategy.label}</h3>
				<code className="text-xs font-mono text-muted">{strategy.code}</code>
				{strategy.next && <span className="text-[0.65rem] uppercase tracking-[0.18em] text-muted border rounded-full px-2 py-0.5" style={{ borderColor: 'currentColor' }}>next release, not on npm yet</span>}
			</div>
			<p className="text-xs text-muted">{strategy.allows}</p>
			{/* The box. Its right edge is the target; overflow is left visible on purpose. */}
			<div
				style={{
					width: `${boxPct}%`,
					fontSize: `${fontSize}px`,
					border: '1px solid color-mix(in oklch, var(--foreground) 45%, transparent)',
					borderRadius: 4,
					background: 'color-mix(in oklch, var(--foreground) 5%, transparent)',
				}}
			>
				<p
					ref={elRef}
					style={{
						fontFamily: font.family,
						fontWeight: 400,
						lineHeight: 1.15,
						margin: 0,
						padding: '0.08em 0',
						display: 'inline-block',
						whiteSpace: 'nowrap',
					}}
				>
					{text}
				</p>
			</div>
			<dl className="flex flex-wrap gap-x-6 gap-y-2" aria-live="off">
				<Figure
					name="wdth"
					value={!usesAxis ? 'not used' : !r || r.axisValue === null ? '—' : r.limits.axis === 'inert' ? 'no effect' : String(+r.axisValue.toFixed(1))}
					factor={usesAxis && r ? times(r.ratios.axis) : undefined}
					note={usesAxis ? axisNote : undefined}
				/>
				<Figure
					name="font size"
					value={!usesSize ? `${fontSize} px, fixed` : !r ? '—' : `${+r.fontSize.toFixed(1)} px`}
					factor={usesSize && r ? times(r.ratios.size) : undefined}
					note={usesSize ? sizeNote : undefined}
				/>
				<Figure
					name="tracking"
					value={!usesTracking ? 'not used' : !r ? '—' : `${r.tracking > 0 ? '+' : ''}${+r.tracking.toFixed(3)}em`}
					factor={usesTracking && r ? times(r.ratios.tracking) : undefined}
					note={usesTracking ? trackingNote : undefined}
				/>
				<div className="flex flex-col gap-0.5 flex-1 min-w-[14rem]">
					<dt className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">result</dt>
					<dd className="text-xs" data-verdict>{r ? verdict(r) : 'Measuring…'}</dd>
				</div>
			</dl>
		</div>
	)
}

/** One bar on the reach ruler (three are stacked), in px of the demo's width. */
function Band({ row, from, to, label }: { row: number; from: number; to: number; label: string }) {
	return (
		<div
			title={label}
			style={{
				position: 'absolute', top: 6 + row * 18, height: 12, borderRadius: 2,
				left: Math.max(0, from), width: Math.max(1, to - Math.max(0, from)),
				background: `color-mix(in oklch, var(--foreground) ${row === 0 ? 85 : 45}%, transparent)`,
			}}
		/>
	)
}

/** Interactive demo: font, size, headline and box width controls; the reach ruler; four strategies. */
export default function Demo() {
	// null: the visitor hasn't moved the slider yet, so the default for this screen width applies.
	const [boxChoice, setBoxPct] = useState<number | null>(null)
	const [fontId, setFontId] = useState(FONTS[0].id)
	const [sizeChoice, setFontSize] = useState<number | null>(null)
	// Narrow screens start with a smaller headline and a wider box, so the first view isn't all overflow.
	const narrow = useMediaQuery('(max-width: 640px)')
	const boxPct = boxChoice ?? (narrow ? 75 : 45)
	const fontSize = sizeChoice ?? (narrow ? 36 : 64)
	const [text, setText] = useState(PRESETS[0])
	const [fullRange, setFullRange] = useState(false)

	// Interaction modes — mutually exclusive
	const [cursorMode, setCursorMode] = useState(false)
	const [gyroMode, setGyroMode] = useState(false)
	// Gyro-driven box width — kept separate from slider state so the slider's value prop never
	// changes during gyro mode (which would make mobile browsers scroll to the input)
	const [gyroBoxPct, setGyroBoxPct] = useState(45)
	// Permission denial feedback for iOS gyro
	const [gyroDenied, setGyroDenied] = useState(false)

	// Width of the demo in px, and a counter bumped when web fonts finish loading: both refit the rows.
	const demoRef = useRef<HTMLDivElement>(null)
	const probeRef = useRef<HTMLParagraphElement>(null)
	const [demoWidth, setDemoWidth] = useState(0)
	const [fontsLoaded, setFontsLoaded] = useState(0)
	const [reach, setReach] = useState<Reach | null>(null)

	// Detected capabilities — resolved client-side after mount
	const showCursor = useMediaQuery('(hover: hover)')
	const isTouch = useMediaQuery('(hover: none)')
	const hasOrientation = useClientValue(() => 'DeviceOrientationEvent' in window, false)
	const showGyro = isTouch && hasOrientation

	const font = FONTS.find(f => f.id === fontId) ?? FONTS[0]
	const [rangeMin, rangeMax] = searchRange(font, fullRange)
	const effectiveBoxPct = gyroMode ? gyroBoxPct : boxPct
	const shownText = text.trim() ? text : PRESETS[0]

	// Track the demo's width so the ruler and the rows share one px scale.
	useEffect(() => {
		const el = demoRef.current
		if (!el || typeof ResizeObserver === 'undefined') return
		const ro = new ResizeObserver(entries => {
			const w = entries[0]?.contentRect.width
			if (w) setDemoWidth(w)
		})
		ro.observe(el)
		return () => ro.disconnect()
	}, [])

	// Load every demo font up front and refit when any font finishes loading: a fit measured in a
	// fallback font is wrong.
	useEffect(() => {
		if (!document.fonts) return
		let cancelled = false
		const bump = () => { if (!cancelled) setFontsLoaded(n => n + 1) }
		const families = ["'Roboto Flex'", "'FW Roboto'", "'Merriweather'", "'FW Anybody'"]
		Promise.all(families.map(f => document.fonts.load(`400 32px ${f}`).catch(() => []))).then(bump)
		document.fonts.ready.then(bump).catch(() => {})
		document.fonts.addEventListener('loadingdone', bump)
		return () => {
			cancelled = true
			document.fonts.removeEventListener('loadingdone', bump)
		}
	}, [])

	// Measure how far each lever reaches for the current headline.
	useEffect(() => {
		const probe = probeRef.current
		if (!probe) return
		const id = requestAnimationFrame(() => setReach(measureReach(probe, [rangeMin, rangeMax], !!font.wdth, fontSize)))
		return () => cancelAnimationFrame(id)
	}, [font, rangeMin, rangeMax, fontSize, shownText, fontsLoaded, demoWidth])

	// Cursor mode — X controls box width (left = narrow, right = wide)
	useEffect(() => {
		if (!cursorMode) return
		const handleMove = (e: MouseEvent) => {
			setBoxPct(Math.round(20 + (e.clientX / window.innerWidth) * (100 - 20)))
		}
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setCursorMode(false)
		}
		window.addEventListener('mousemove', handleMove)
		window.addEventListener('keydown', handleKey)
		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('keydown', handleKey)
		}
	}, [cursorMode])

	// Gyro mode — gamma (left/right tilt) controls box width, throttled to one update per frame.
	useEffect(() => {
		if (!gyroMode) return
		let rafId: number | null = null
		const handleOrientation = (e: DeviceOrientationEvent) => {
			if (rafId !== null) return
			rafId = requestAnimationFrame(() => {
				rafId = null
				if (e.gamma !== null) {
					// gamma: -90 (tilt left) to 90 (tilt right) → box width 20–100%
					setGyroBoxPct(Math.round(20 + ((e.gamma + 90) / 180) * (100 - 20)))
				}
			})
		}
		window.addEventListener('deviceorientation', handleOrientation)
		return () => {
			window.removeEventListener('deviceorientation', handleOrientation)
			if (rafId !== null) cancelAnimationFrame(rafId)
		}
	}, [gyroMode])

	// Toggle cursor mode — turns off gyro if active
	const toggleCursor = useCallback(() => {
		setGyroMode(false)
		setGyroDenied(false)
		setCursorMode(v => !v)
	}, [])

	// Toggle gyro mode — requests iOS permission if needed, turns off cursor if active
	const toggleGyro = useCallback(async () => {
		if (gyroMode) {
			setGyroMode(false)
			setGyroDenied(false)
			return
		}
		setCursorMode(false)
		setGyroDenied(false)
		const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
			requestPermission?: () => Promise<PermissionState>
		}
		if (typeof DOE.requestPermission === 'function') {
			const permission = await DOE.requestPermission()
			if (permission === 'granted') {
				setGyroMode(true)
			} else {
				setGyroDenied(true)
			}
		} else {
			setGyroMode(true)
		}
	}, [gyroMode])

	const labelClass = "flex justify-between gap-3 text-xs uppercase tracking-[0.18em] font-medium text-muted"
	const chip = (active: boolean): React.CSSProperties => ({
		borderColor: active ? 'currentColor' : 'color-mix(in oklch, var(--foreground) 45%, transparent)',
		background: active ? 'var(--btn-bg)' : 'transparent',
		color: active ? 'var(--foreground)' : 'var(--foreground-muted)',
	})
	// The box's inner (content) width in px: what the rows are fitted to.
	const boxPx = demoWidth ? Math.max(0, (demoWidth * effectiveBoxPct) / 100 - 2) : 0
	const layoutKey = `${demoWidth}|${fontsLoaded}`

	return (
		<div ref={demoRef} className="w-full flex flex-col gap-8">
			{/* Controls */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
				<div className="flex flex-col gap-1">
					<label htmlFor="fw-font" className={labelClass}><span>Font</span></label>
					<select
						id="fw-font"
						value={fontId}
						onChange={e => setFontId(e.target.value)}
						className="text-sm rounded border px-2 py-1.5"
						style={{ background: 'var(--btn-bg)', borderColor: 'color-mix(in oklch, var(--foreground) 45%, transparent)', color: 'var(--foreground)' }}
					>
						{FONTS.map(f => <option key={f.id} value={f.id}>{f.label}{f.wdth ? ` · wdth ${f.wdth[0]}–${f.wdth[1]}` : ''}</option>)}
					</select>
				</div>

				<div className="flex flex-col gap-1">
					<div className={labelClass}>
						<span>Font size you set</span>
						<span className="tabular-nums">{fontSize} px</span>
					</div>
					<input
						type="range" min={24} max={120} step={1} value={fontSize}
						aria-label="Font size in pixels"
						aria-valuetext={`${fontSize} pixels`}
						onChange={e => setFontSize(Number(e.target.value))}
						onTouchStart={e => e.stopPropagation()}
						style={{ touchAction: 'none' }}
					/>
				</div>

				<div className="flex flex-col gap-1">
					<div className={labelClass}>
						<span>Box width</span>
						<span className="tabular-nums">{Math.round(effectiveBoxPct)}%{boxPx ? ` · ${Math.round(boxPx)} px` : ''}</span>
					</div>
					<input
						type="range" min={20} max={100} step={1} value={boxPct}
						aria-label="Box width as a percentage of the demo"
						aria-valuetext={`${Math.round(effectiveBoxPct)} percent`}
						title={cursorMode || gyroMode ? "Disabled while cursor or tilt mode is active" : "Drag to resize the box; every row re-fits to the new width"}
						disabled={cursorMode || gyroMode}
						onChange={e => setBoxPct(Number(e.target.value))}
						onTouchStart={e => e.stopPropagation()}
						style={{ touchAction: 'none', opacity: (cursorMode || gyroMode) ? 0.3 : undefined }}
					/>
				</div>

				<div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
					<label htmlFor="fw-text" className={labelClass}><span>Headline (one line)</span></label>
					<div className="flex flex-wrap items-center gap-2">
						<input
							id="fw-text"
							type="text"
							value={text}
							maxLength={40}
							onChange={e => setText(e.target.value)}
							className="text-sm rounded border px-2 py-1.5 flex-1 min-w-40"
							style={{ background: 'transparent', borderColor: 'color-mix(in oklch, var(--foreground) 45%, transparent)', color: 'var(--foreground)' }}
						/>
						{PRESETS.map(p => (
							<button key={p} onClick={() => setText(p)} aria-pressed={text === p} className="text-xs px-3 py-1 rounded-full border" style={chip(text === p)}>
								{p}
							</button>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-1" role="group" aria-label="wdth search range">
					<div className={labelClass}><span>wdth range searched</span><span className="tabular-nums">{font.wdth ? `${rangeMin}–${rangeMax}` : 'none'}</span></div>
					<div className="flex flex-wrap gap-2">
						<button onClick={() => setFullRange(false)} aria-pressed={!fullRange} className="text-xs px-3 py-1 rounded-full border" style={chip(!fullRange)}>
							Default 75–125
						</button>
						<button onClick={() => setFullRange(true)} aria-pressed={fullRange} disabled={!font.wdth} className="text-xs px-3 py-1 rounded-full border" style={{ ...chip(fullRange), opacity: font.wdth ? undefined : 0.4 }}>
							Font’s full range{font.wdth ? ` ${font.wdth[0]}–${font.wdth[1]}` : ''}
						</button>
					</div>
				</div>
			</div>

			<p className="text-xs text-muted -mt-4">
				{font.note}
				{font.wdth && !fullRange && (font.wdth[0] > DEFAULT_RANGE[0] || font.wdth[1] < DEFAULT_RANGE[1]) && ` fitWidth’s default search is 75–125, but this font only has ${font.wdth[0]}–${font.wdth[1]}, so ${rangeMin}–${rangeMax} is searched.`}
			</p>

			{/* Cursor / tilt toggles */}
			{(showCursor || showGyro) && (
				<div className="flex flex-wrap items-center gap-3 -mt-4">
					{showCursor && (
						<button onClick={toggleCursor} aria-pressed={cursorMode} title="Move the cursor left and right to set the box width" className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border" style={chip(cursorMode)}>
							<CursorIcon />
							<span>{cursorMode ? 'Esc to exit' : 'Cursor sets box width'}</span>
						</button>
					)}
					{showGyro && (
						<button onClick={toggleGyro} aria-pressed={gyroMode} title="Tilt left and right to set the box width" className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border" style={chip(gyroMode)}>
							<GyroIcon />
							<span>{gyroMode ? 'Tilt active' : 'Tilt sets box width'}</span>
						</button>
					)}
					<div aria-live="polite" aria-atomic="true" className="contents">
						{gyroDenied && (
							<p className="text-xs text-muted italic">
								Motion permission denied. Enable motion access in your device settings to use tilt.
							</p>
						)}
					</div>
				</div>
			)}

			{/* Hidden probe for the reach measurements, laid out like a row's headline */}
			<div aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: 0, top: 0, width: 0, height: 0, overflow: 'hidden' }}>
				<p ref={probeRef} style={{ fontFamily: font.family, fontWeight: 400, lineHeight: 1.15, margin: 0, display: 'inline-block', whiteSpace: 'nowrap' }}>{shownText}</p>
			</div>

			{/* Reach ruler */}
			<div className="flex flex-col gap-3" data-reach>
				<h3 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">How far each lever reaches</h3>
				{reach && demoWidth > 0 ? (
					<>
						<p className="text-sm leading-relaxed" data-reach-summary>
							“{shownText}” is <strong>{px(reach.natural)}</strong> wide as set ({font.label}, {fontSize} px). The box is <strong>{px(boxPx)}</strong>, which is <strong>{pct(boxPx, reach.natural)}</strong> of that.{' '}
							{font.wdth
								? <>On its own, wdth {rangeMin}–{rangeMax} can make it <strong>{pct(reach.axis[0], reach.natural)} to {pct(reach.axis[1], reach.natural)}</strong> of its set width ({px(reach.axis[0])} to {px(reach.axis[1])}).{' '}
									{boxPx >= reach.axis[0] - 0.5 && boxPx <= reach.axis[1] + 0.5
										? 'The box is inside that range, so the axis can do this fit alone.'
										: boxPx > reach.axis[1]
											? 'The box is wider than that, so the axis runs out and something else has to do the rest.'
											: 'The box is narrower than that, so the axis runs out and something else has to do the rest.'}</>
								: 'This font has no wdth axis, so the axis can’t change its width at all.'}
						</p>
						<div aria-hidden="true" style={{ position: 'relative', height: 60, overflow: 'hidden', borderRadius: 4, border: '1px solid color-mix(in oklch, var(--foreground) 25%, transparent)' }}>
							<Band row={0} from={reach.axis[0]} to={reach.axis[1]} label="wdth alone" />
							<Band row={1} from={reach.tracking[0]} to={reach.tracking[1]} label="wdth and ±0.3em tracking" />
							<Band row={2} from={reach.size[0]} to={reach.size[1]} label="wdth, font size 0.5–2× and ±0.05em tracking" />
							{/* Natural width tick */}
							<div style={{ position: 'absolute', top: 0, bottom: 0, left: reach.natural, width: 0, borderLeft: '1px dashed var(--foreground)' }} />
							{/* Box edge */}
							<div style={{ position: 'absolute', top: 0, bottom: 0, left: Math.min(demoWidth - 3, boxPx), width: 3, background: 'var(--foreground)' }} />
						</div>
						<ul className="flex flex-col gap-1 text-xs text-muted">
							<li>Top bar, <strong>wdth alone</strong>: <span className="font-mono tabular-nums">{pct(reach.axis[0], reach.natural)}–{pct(reach.axis[1], reach.natural)}</span> of the width as set</li>
							<li>Middle bar, wdth plus ±{DEFAULT_TRACKING}em tracking: <span className="font-mono tabular-nums">{pct(reach.tracking[0], reach.natural)}–{pct(reach.tracking[1], reach.natural)}</span></li>
							<li>Bottom bar, wdth plus font size {SIZE_RANGE[0]}–{SIZE_RANGE[1]}× and ±{SIZED_TRACKING}em tracking: <span className="font-mono tabular-nums">{pct(reach.size[0], reach.natural)}–{pct(reach.size[1], reach.natural)}</span></li>
							<li>Dashed line: the width as set. Solid line: the box edge. Where the solid line misses a bar, that combination can’t reach the box.</li>
						</ul>
						<p className="text-xs text-muted">The ruler is drawn at the same scale as the boxes below: 1 px is 1 px. Measured in your browser, for this headline, font and size.</p>
					</>
				) : (
					<p className="text-sm text-muted">Measuring…</p>
				)}
			</div>

			{/* The same headline, four ways */}
			<div className="flex flex-col gap-10">
				<h3 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">One headline, one box, four ways to fit it</h3>
				{STRATEGIES.map(s => (
					<StrategyRow
						key={s.id}
						strategy={s}
						text={shownText}
						font={font}
						rangeMin={rangeMin}
						rangeMax={rangeMax}
						fontSize={fontSize}
						boxPct={effectiveBoxPct}
						layoutKey={layoutKey}
					/>
				))}
			</div>

			<p className="text-xs text-muted" style={{ lineHeight: "1.8" }}>
				{font.id === 'roboto-flex' && 'Roboto Flex has an optical-size axis that follows font size, so a 2× font size is not 2× the width, and its wdth reach is smaller at small sizes: drag “Font size you set” and watch the ruler. '}
				Each “×” is how much that step changed the headline’s width; multiply them and you get the fitted width over the width as set. A fit is never wider than the box and at most half a pixel narrower. When every range a strategy may use has run out, the row says how far short (or over) it ended: fitWidth stops there and warns in the console. It does not force the fit. The numbers under each row come from the object <code className="font-mono">applyFitWidth</code> returns.
			</p>
		</div>
	)
}
