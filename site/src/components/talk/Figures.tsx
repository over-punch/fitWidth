// Figures for the paper "Width, Font Size, Tracking" (reach of 21 families, Roboto Flex by size, the 336-case result), in the site's colour tokens; bars grow on scroll via the .fig-* classes in talk.css.
import type { CSSProperties, ReactNode } from 'react'
import { FAMILIES, MEDIAN_REACH, OPSZ, GRID_TOTAL } from '../../content/measurements'

/** Shared caption under each figure. */
function Caption({ children }: { children: ReactNode }) {
	return <figcaption className="mt-3 px-2 lg:px-8 text-xs text-muted tracking-wide">{children}</figcaption>
}

/** Figure heading in the Merriweather display style. */
function FigTitle({ children }: { children: ReactNode }) {
	return <p className="mb-6 text-xl lg:text-2xl" style={{ fontFamily: 'var(--font-merriweather), serif', fontVariationSettings: '"wght" 300, "opsz" 36' }}>{children}</p>
}

/** Position of a share of natural width on a 50%–150% track, as a CSS percentage. */
function pos(share: number): string {
	return `${Math.min(100, Math.max(0, (share - 0.5) * 100))}%`
}

/** Reach of wdth 75–125 in each of the 21 measured families, with the median band and the natural-width line. */
export function ReachFigure() {
	return (
		<div className="fig rounded-xl p-6 lg:p-8" style={{ background: 'var(--panel)' }}>
			<FigTitle>How far wdth 75–125 moves a headline: median {Math.round(MEDIAN_REACH[0] * 100)}% to {Math.round(MEDIAN_REACH[1] * 100)}%.</FigTitle>
			<div className="flex flex-col gap-1.5" role="img" aria-label={FAMILIES.map(f => `${f.name} ${Math.round(f.chrome[0] * 100)} to ${Math.round(f.chrome[1] * 100)} percent`).join('; ')}>
				{FAMILIES.map((f, i) => (
					<div key={f.name} className="grid grid-cols-[7.5rem_minmax(0,1fr)_4.5rem] sm:grid-cols-[10rem_minmax(0,1fr)_5rem] gap-3 items-center">
						<span className="text-sm text-muted truncate">{f.name}</span>
						<span className="relative h-3.5 rounded-sm" style={{ background: 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}>
							<span className="absolute inset-y-0" style={{ left: pos(MEDIAN_REACH[0]), width: `${(MEDIAN_REACH[1] - MEDIAN_REACH[0]) * 100}%`, background: 'color-mix(in oklch, var(--foreground) 16%, transparent)' }} />
							<span className="fig-grow absolute inset-y-0 rounded-sm" style={{ left: pos(f.chrome[0]), width: `${Math.max(0.6, (f.chrome[1] - f.chrome[0]) * 100)}%`, background: 'var(--foreground)', ['--r' as string]: `entry ${10 + i * 3}% entry 100%` } as CSSProperties} />
							<span className="absolute -inset-y-0.5" style={{ left: pos(1), width: 0, borderLeft: '1px dashed var(--panel)' }} />
						</span>
						<span className="text-sm tabular-nums text-right">{Math.round(f.chrome[0] * 100)}–{Math.round(f.chrome[1] * 100)}%</span>
					</div>
				))}
			</div>
			<Caption>Scale 50% to 150% of the width at wdth 100; the dashed line is 100% and the shaded band is the median. Mean of five strings at 72 px, weight 400, Chromium 149, fonts from google/fonts at commit 7085eb8, 7 October 2026.</Caption>
		</div>
	)
}

/** Roboto Flex: reach of wdth 75 and 125 at each font size, as bars on a 70%–130% track. */
export function OpszFigure() {
	return (
		<div className="fig rounded-xl p-6 lg:p-8" style={{ background: 'var(--panel)' }}>
			<FigTitle>Roboto Flex: the same axis reaches further as the type gets bigger.</FigTitle>
			<div className="flex flex-col gap-2">
				{OPSZ.map(([px, lo, hi], i) => (
					<div key={px} className="grid grid-cols-[4rem_minmax(0,1fr)_5.5rem] gap-3 items-center">
						<span className="text-sm text-muted tabular-nums">{px} px</span>
						<span className="relative h-4 rounded-sm" style={{ background: 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}>
							<span className="fig-grow absolute inset-y-0 rounded-sm" style={{ left: `${((lo - 0.7) / 0.6) * 100}%`, width: `${((hi - lo) / 0.6) * 100}%`, background: 'var(--foreground)', ['--r' as string]: `entry ${15 + i * 8}% entry 100%` } as CSSProperties} />
							<span className="absolute -inset-y-0.5" style={{ left: '50%', width: 0, borderLeft: '1px dashed var(--panel)' }} />
						</span>
						<span className="text-sm tabular-nums text-right">{(lo * 100).toFixed(1)}–{(hi * 100).toFixed(1)}%</span>
					</div>
				))}
			</div>
			<Caption>Width at wdth 75 and at wdth 125 as a share of the width at wdth 100, at each font size, with optical size following the size automatically. Scale 70% to 130%. Mean of five strings, Chromium 149; HarfBuzz gives the same figures at the matching opsz.</Caption>
		</div>
	)
}

/** The 336-case sweep: how many fits each strategy reached. */
export function GridFigure() {
	const rows: [string, number, boolean][] = [
		['Width axis only', GRID_TOTAL.axis, true],
		['Tracking only, ±0.3em', GRID_TOTAL.tracking, false],
		['Axis, then tracking (default)', GRID_TOTAL.auto, false],
		['Axis, then size, then ±0.05em', GRID_TOTAL.size, false],
	]
	return (
		<div className="fig rounded-xl p-6 lg:p-8" style={{ background: 'var(--panel)' }}>
			<FigTitle>21 fonts × 16 target widths: the axis alone fitted {GRID_TOTAL.axis} of {GRID_TOTAL.cases}.</FigTitle>
			<div className="flex flex-col gap-2">
				{rows.map(([label, n, strong], i) => (
					<div key={label} className="grid grid-cols-[9rem_minmax(0,1fr)_3rem] sm:grid-cols-[15rem_minmax(0,1fr)_3.5rem] gap-3 items-center">
						<span className="text-sm text-muted">{label}</span>
						<span className="h-5 rounded-sm" style={{ background: 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}>
							<span className="fig-grow block h-full rounded-sm" style={{ width: `${(n / GRID_TOTAL.cases) * 100}%`, background: strong ? 'var(--foreground)' : 'color-mix(in oklch, var(--foreground) 55%, transparent)', ['--r' as string]: `entry ${20 + i * 12}% entry 100%` } as CSSProperties} />
						</span>
						<span className="text-sm tabular-nums text-right">{n}</span>
					</div>
				))}
			</div>
			<Caption>“Headline fitting” at 72 px in each of the 21 fonts, targets from 0.5× to 2× natural width in steps of 0.1×. fitWidth built from its repository (ahead of npm 1.1.0), Chromium 149. A fit is never wider than the target and at most 0.5 px narrower.</Caption>
		</div>
	)
}
