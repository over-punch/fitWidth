// Public paper route (fitwidth.com/paper) — "Width, Font Size, Tracking: Who Really Does the Fitting?", rendered from content/paper.ts in the Type Tools site style.
import type { Metadata } from 'next'
import Link from 'next/link'
import '../talk.css'
import Prose, { slug } from '../../components/talk/Prose'
import { ReachFigure, OpszFigure, GridFigure } from '../../components/talk/Figures'
import { PAPER_MD } from '../../content/paper'
import SiteFooter from '../../components/SiteFooter'
import { version } from '../../../../package.json'
import { version as siteVersion } from '../../../package.json'

export const metadata: Metadata = {
	title: 'Width, Font Size, Tracking: Who Really Does the Fitting? A paper | Fit Width',
	description: 'A census of width axes on Google Fonts, the measured reach of 21 of them, a 336-case test of our own fitting library, and the fitting order that follows.',
	alternates: { canonical: 'https://fitwidth.com/paper' },
	openGraph: {
		title: 'Width, Font Size, Tracking: Who Really Does the Fitting? A paper',
		description: '97 of 1,950 Google Fonts families have a width axis. In 21 we measured, the median reach is 80% to 113% of natural width.',
		url: 'https://fitwidth.com/paper',
		siteName: 'Fit Width',
		type: 'article',
	},
}

/** Figure components available to {{figure:name}} slots in the paper. */
const FIGURES = {
	reach: <ReachFigure />,
	opsz: <OpszFigure />,
	grid: <GridFigure />,
}

/** Section headings (## lines) for the table of contents. */
const SECTIONS = PAPER_MD.split('\n').filter(l => l.startsWith('## ')).map(l => l.slice(3).trim())

/** The paper page: hero, contents, body, footer. */
export default function PaperPage() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-16">
			<header className="w-full max-w-2xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="load-rise text-xs uppercase tracking-[0.18em] font-medium text-muted">A paper · October 2026</p>
					<h1 className="load-rise text-4xl lg:text-6xl" style={{ ['--d' as string]: '90ms', fontFamily: 'var(--font-merriweather), serif', fontVariationSettings: '"wght" 300, "opsz" 144', lineHeight: '1.05em', textWrap: 'balance' } as React.CSSProperties}>
						Width, font size, tracking:<br />
						<span style={{ fontStyle: 'italic', color: 'var(--foreground-subtle)' }}>who really does the fitting?</span>
					</h1>
				</div>
				<div className="load-rise flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" style={{ ['--d' as string]: '220ms' } as React.CSSProperties}>
					<Link href="/talk" className="hover:text-foreground transition-colors">Slides ↗</Link>
					<span aria-hidden="true">·</span>
					<Link href="/paper/data" className="hover:text-foreground transition-colors">Data ↗</Link>
					<span aria-hidden="true">·</span>
					<a href="/paper/width-font-size-tracking.pdf" download className="hover:text-foreground transition-colors">Paper PDF ↓</a>
					<span aria-hidden="true">·</span>
					<Link href="/talk/transcript" className="hover:text-foreground transition-colors">Transcript ↗</Link>
					<span aria-hidden="true">·</span>
					<Link href="/#demo" className="hover:text-foreground transition-colors">Demo ↗</Link>
				</div>
				<nav aria-label="Contents" className="load-rise flex flex-col gap-2 pt-2" style={{ ['--d' as string]: '320ms' } as React.CSSProperties}>
					<p className="text-xs uppercase tracking-[0.18em] font-medium text-muted">Contents</p>
					<ol className="flex flex-col gap-1 text-sm">
						{SECTIONS.map((s, i) => (
							<li key={s} className="flex gap-3">
								<span className="font-mono text-xs text-faint tabular-nums pt-0.5">{String(i + 1).padStart(2, '0')}</span>
								<a href={`#${slug(s)}`} className="text-muted hover:text-foreground transition-colors">{s}</a>
							</li>
						))}
					</ol>
				</nav>
			</header>
			<article className="w-full max-w-2xl flex flex-col gap-5">
				<Prose source={PAPER_MD} figures={FIGURES} />
			</article>
			<SiteFooter current="fitWidth" npmVersion={version} siteVersion={siteVersion} />
		</main>
	)
}
