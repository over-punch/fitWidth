// Data route (fitwidth.com/paper/data) — the census of width axes, the 21 measured reaches and the 336-case sweep behind "Width, Font Size, Tracking".
import type { Metadata } from 'next'
import Link from 'next/link'
import '../../talk.css'
import { FAMILIES, MEDIAN_REACH, WIDENERS, GRID, GRID_TOTAL, DEFAULT_TRACKING, TRAILING, OPSZ, CENSUS, WDTH_FAMILIES } from '../../../content/measurements'
import SiteFooter from '../../../components/SiteFooter'
import { version } from '../../../../../package.json'
import { version as siteVersion } from '../../../../package.json'

export const metadata: Metadata = {
	title: 'Width, Font Size, Tracking: the data | Fit Width',
	description: 'Every Google Fonts family with a width axis and its range, the measured reach of 21 of them in Chromium and HarfBuzz, and a 336-case test of the fitWidth library.',
	alternates: { canonical: 'https://fitwidth.com/paper/data' },
	openGraph: {
		title: 'Width, Font Size, Tracking: the data',
		description: '97 width axes, 21 measured reaches, 336 fits.',
		url: 'https://fitwidth.com/paper/data',
		siteName: 'Fit Width',
		type: 'article',
	},
}

/** Table header cell classes. */
const TH = 'text-left font-normal text-muted px-2 py-2 border-b border-foreground/10'

/** Formats a share of natural width as a percentage with one decimal. */
function pct(n: number): string {
	return `${(n * 100).toFixed(1)}%`
}

/** The data page: hero, then one table per dataset with a reconciliation line. */
export default function DataPage() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-14">
			<header className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="load-rise text-xs uppercase tracking-[0.18em] font-medium text-muted">Data · October 2026</p>
					<h1 className="load-rise text-4xl lg:text-7xl" style={{ ['--d' as string]: '90ms', fontFamily: 'var(--font-merriweather), serif', fontVariationSettings: '"wght" 300, "opsz" 144', lineHeight: '1.05em', textWrap: 'balance' } as React.CSSProperties}>
						{CENSUS.wdth} width axes,<br />
						<span style={{ fontStyle: 'italic', color: 'var(--foreground-subtle)' }}>{FAMILIES.length} measured.</span>
					</h1>
				</div>
				<p className="text-base text-muted leading-relaxed max-w-xl">
					The numbers behind the <Link href="/paper" className="underline underline-offset-2 hover:text-foreground">paper</Link> and the <Link href="/talk" className="underline underline-offset-2 hover:text-foreground">talk</Link>. Method is in the paper. Everything here was measured on 7 October 2026 with Chromium 149, uharfbuzz 0.56.1, fonts from google/fonts at commit 7085eb8, and published fitWidth 1.2.0 from npm.
				</p>
			</header>

			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">1. Reach of wdth 75–125 in {FAMILIES.length} families</h2>
				<p className="text-sm text-muted max-w-2xl">Width at wdth 75 and 125 (each clamped to the font&rsquo;s own range) as a share of the width at wdth 100. Mean of five strings at 72 px, weight 400. Median narrowest {pct(MEDIAN_REACH[0])}; median widest {pct(MEDIAN_REACH[1])} (two separate medians). Among the {WIDENERS.count} that can widen, the median widest is {pct(WIDENERS.median)}. The last two columns are the reach over each font&rsquo;s whole wdth range (HarfBuzz only). {FAMILIES.filter(f => f.chrome[1] < 1.005).length} can&rsquo;t widen; {FAMILIES.filter(f => f.chrome[1] - f.chrome[0] < 0.3).length} span less than 30 points; {FAMILIES.filter(f => f.chrome[1] - f.chrome[0] < 0.2).length} less than 20.</p>
				<div className="overflow-x-auto">
					<table className="w-full text-sm border-collapse">
						<thead><tr>{['Family', 'Font’s wdth range', 'Optical size axis', 'Chromium: narrowest', 'Chromium: widest', 'HarfBuzz: narrowest', 'HarfBuzz: widest', 'Full range: narrowest', 'Full range: widest'].map(h => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
						<tbody>{FAMILIES.map(f => (
							<tr key={f.name} className="odd:bg-foreground/[0.04]">
								<td className="px-2 py-1.5">{f.name}</td>
								<td className="px-2 py-1.5 tabular-nums text-muted">{f.wdth[0]}–{f.wdth[1]}</td>
								<td className="px-2 py-1.5 text-muted">{f.opsz ? 'yes' : 'no'}</td>
								<td className="px-2 py-1.5 tabular-nums">{pct(f.chrome[0])}</td>
								<td className="px-2 py-1.5 tabular-nums">{pct(f.chrome[1])}</td>
								<td className="px-2 py-1.5 tabular-nums text-muted">{pct(f.harfbuzz[0])}</td>
								<td className="px-2 py-1.5 tabular-nums text-muted">{pct(f.harfbuzz[1])}</td>
								<td className="px-2 py-1.5 tabular-nums text-muted">{pct(f.full[0])}</td>
								<td className="px-2 py-1.5 tabular-nums text-muted">{pct(f.full[1])}</td>
							</tr>
						))}</tbody>
					</table>
				</div>
			</section>

			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">2. The library on those {FAMILIES.length} fonts: {GRID_TOTAL.cases} fits</h2>
				<p className="text-sm text-muted max-w-2xl">&ldquo;Headline fitting&rdquo; at 72 px. Each cell is how many of the {FAMILIES.length} fonts fitted the target (never wider, at most 0.5 px narrower). Totals: axis only {GRID_TOTAL.axis}, tracking only {GRID_TOTAL.tracking}, axis then tracking {GRID_TOTAL.auto}, axis then size then tracking {GRID_TOTAL.size}, each of {GRID_TOTAL.cases}. Without the 1.0× row the axis-only total is {GRID_TOTAL.axis - (GRID.find(r => r.ratio === 1)?.axis ?? 0)} of {GRID_TOTAL.cases - FAMILIES.length}. The targets end at 2×, which is also the size option&rsquo;s limit. The first three columns are the same in published 1.2.0 and 1.1.0 (1,008 fits, identical styles); the last uses the opt-in <code className="font-mono">size</code> option, new in 1.2.0. Of the default&rsquo;s {DEFAULT_TRACKING.fits} fits, {DEFAULT_TRACKING.over005} added more than 0.05em of tracking and {DEFAULT_TRACKING.over012} more than 0.12em (median {DEFAULT_TRACKING.medianEm}em). In the {TRAILING.cases} default fits that added tracking, the last letter ended from {Math.abs(TRAILING.min)} px short of the target to {TRAILING.max} px past it (median {TRAILING.median} px away); with <code className="font-mono">trimTrailingSpace</code>, {TRAILING.trimmedFits} of them still fit, {Math.abs(TRAILING.trimmedMax)} to {Math.abs(TRAILING.trimmedMin)} px inside.</p>
				<div className="overflow-x-auto">
					<table className="w-full text-sm border-collapse">
						<thead><tr>{['Target ÷ natural width', 'Width axis only', 'Tracking only (±0.3em)', 'Axis, then tracking (default)', 'Axis, then size 0.5–2×, then ±0.05em'].map(h => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
						<tbody>
							{GRID.map(r => (
								<tr key={r.ratio} className="odd:bg-foreground/[0.04]">
									<td className="px-2 py-1.5 tabular-nums">{r.ratio.toFixed(1)}×</td>
									<td className="px-2 py-1.5 tabular-nums">{r.axis}</td>
									<td className="px-2 py-1.5 tabular-nums text-muted">{r.tracking}</td>
									<td className="px-2 py-1.5 tabular-nums text-muted">{r.auto}</td>
									<td className="px-2 py-1.5 tabular-nums text-muted">{r.size}</td>
								</tr>
							))}
							<tr>
								<td className="px-2 py-1.5 font-semibold">All {GRID_TOTAL.cases}</td>
								<td className="px-2 py-1.5 tabular-nums font-semibold">{GRID_TOTAL.axis}</td>
								<td className="px-2 py-1.5 tabular-nums font-semibold">{GRID_TOTAL.tracking}</td>
								<td className="px-2 py-1.5 tabular-nums font-semibold">{GRID_TOTAL.auto}</td>
								<td className="px-2 py-1.5 tabular-nums font-semibold">{GRID_TOTAL.size}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">3. Roboto Flex by font size</h2>
				<p className="text-sm text-muted max-w-2xl">Width at wdth 75 and 125 as a share of the width at wdth 100, with optical size following the font size. Mean of five strings, Chromium 149.</p>
				<div className="overflow-x-auto">
					<table className="w-full max-w-md text-sm border-collapse">
						<thead><tr>{['Font size', 'wdth 75', 'wdth 125'].map(h => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
						<tbody>{OPSZ.map(([px, lo, hi]) => (
							<tr key={px} className="odd:bg-foreground/[0.04]">
								<td className="px-2 py-1.5 tabular-nums">{px} px</td>
								<td className="px-2 py-1.5 tabular-nums">{pct(lo)}</td>
								<td className="px-2 py-1.5 tabular-nums">{pct(hi)}</td>
							</tr>
						))}</tbody>
					</table>
				</div>
			</section>

			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">4. Every Google Fonts family with a wdth axis</h2>
				<p className="text-sm text-muted max-w-2xl">From fonts.google.com/metadata/fonts, fetched 7 October 2026, 10:44 UTC. {CENSUS.families.toLocaleString('en')} families; {CENSUS.variable} variable; {CENSUS.wdth} with a wdth axis ({CENSUS.noto} of them Noto and {CENSUS.anek} Anek, each one design released for many scripts). Of those {CENSUS.wdth}: {CENSUS.maxAt100} stop at 100 ({CENSUS.notoMaxAt100} of them Noto), {CENSUS.minAt100} start at 100, and {CENSUS.wdth - CENSUS.maxAt100 - CENSUS.minAt100} go both ways; {CENSUS.cover75to125} cover all of 75–125 and {CENSUS.exactly75to125} are exactly 75–125. Median span {CENSUS.medianSpan} units. Sorted by span.</p>
				<div className="overflow-x-auto">
					<table className="w-full max-w-2xl text-sm border-collapse">
						<thead><tr>{['Family', 'Min', 'Max', 'Span'].map(h => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
						<tbody>{WDTH_FAMILIES.map(([name, min, max]) => (
							<tr key={name} className="odd:bg-foreground/[0.04]">
								<td className="px-2 py-1.5">{name}</td>
								<td className="px-2 py-1.5 tabular-nums text-muted">{min}</td>
								<td className="px-2 py-1.5 tabular-nums text-muted">{max}</td>
								<td className="px-2 py-1.5 tabular-nums">{max - min}</td>
							</tr>
						))}</tbody>
					</table>
				</div>
			</section>
			<SiteFooter current="fitWidth" npmVersion={version} siteVersion={siteVersion} />
		</main>
	)
}
