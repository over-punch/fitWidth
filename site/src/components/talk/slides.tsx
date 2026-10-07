// Slides for "Width, Font Size, Tracking: Who Really Does the Fitting?" — fitWidth's talk content (slide list, charts, live specimens) on top of the shared talk engine.
'use client'

import type { ReactNode } from 'react'
import { SCRIPT_NOTES } from '../../content/talkScript'
import { FAMILIES, MEDIAN_REACH, GRID_TOTAL, CENSUS, OPSZ, TRAILING } from '../../content/measurements'
import { A, MONO, display, rise, CountUp, Eyebrow, Title, Body, Card, Numeral, Reveal, Frame, ThreeUp, type Slide } from './engine'

/** Source URLs cited in footers. */
const SRC = {
	opentype: 'https://learn.microsoft.com/en-us/typography/opentype/spec/dvaraxistag_wdth',
	csswg: 'https://github.com/w3c/csswg-drafts/issues/2528',
	gf: 'https://fonts.google.com/metadata/fonts',
	butterick: 'https://practicaltypography.com/letterspacing.html',
	explainer: 'https://github.com/explainers-by-googlers/css-fit-text/blob/10ab4afa754de77696c902e2a0c64ee7b4db59c8/README.md',
	text5: 'https://github.com/w3c/csswg-drafts/blob/4ceb2136bd/css-text-5/Overview.bs',
	penney: 'https://github.com/Lorp/fit-to-width',
	paper: '/paper',
	data: '/paper/data',
}

/** Talk title, used in footers and the page chrome. */
export const TALK_TITLE = 'Width, Font Size, Tracking: Who Really Does the Fitting?'

/** Heights (px) of the two demo-row renders when drawn 820 px wide, from their captured sizes (461×98.0 and 461×120.8 CSS px). */
const ROW_H = { auto: 174, size: 215 }

/** Roboto Flex stack for live specimens (the font the demo opens on). */
const FLEX = "'Roboto Flex', sans-serif"

/** A small italic quotation with its attribution, for slides where the quote supports a chart. */
function SmallQuote({ q, who, size = 34 }: { q: string; who: ReactNode; size?: number }) {
	return (
		<Card style={{ padding: 36, gap: 20 }}>
			<p style={display(size, { fontStyle: 'italic', lineHeight: 1.35 })}>{q}</p>
			<p style={{ fontSize: 22, letterSpacing: '0.04em', color: 'var(--t-muted)' }}>{who}</p>
		</Card>
	)
}

/** Seven of the 21 measured families, chosen to show the spread, in the order they appear on the reach slide. */
const SHOWN = ['IBM Plex Sans', 'Roboto', 'Merriweather', 'Open Sans', 'Roboto Flex', 'Archivo', 'Anybody']

/** Seven of the 21 measured families as range bars on a 50%–150% scale; the median band (from all 21) and its labels appear with `on`. */
function ReachChart({ on }: { on: boolean }) {
	/** Horizontal position of a share of natural width, as a percentage of the track. */
	const pos = (share: number) => `${(share - 0.5) * 100}%`
	const rows = SHOWN.map(n => FAMILIES.find(f => f.name === n)!)
	return (
		<div style={{ position: 'relative', width: 1664 }} role="img" aria-label={`Reach of the width axis over 75 to 125: ${rows.map(f => `${f.name} ${Math.round(f.chrome[0] * 100)} to ${Math.round(f.chrome[1] * 100)} percent`).join('; ')}. Across all 21 measured families, the median narrowest is ${Math.round(MEDIAN_REACH[0] * 100)} percent and the median widest ${Math.round(MEDIAN_REACH[1] * 100)} percent.`}>
			<div style={{ display: 'grid', gridTemplateColumns: '330px 1fr 190px', gap: 28, height: 40, alignItems: 'end', fontSize: 24, color: 'var(--t-muted)' }}>
				<span />
				<span style={{ position: 'relative', height: 40 }}>
					<span style={{ position: 'absolute', left: 0, bottom: 6 }}>50%</span>
					<span style={{ position: 'absolute', left: pos(1), bottom: 6, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>100% · as designed</span>
					<span style={{ position: 'absolute', right: 0, bottom: 6 }}>150%</span>
				</span>
				<span />
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				{rows.map(f => (
					<div key={f.name} style={{ display: 'grid', gridTemplateColumns: '330px 1fr 190px', alignItems: 'center', gap: 28, height: 46 }}>
						<span style={{ fontSize: 32, whiteSpace: 'nowrap' }}>{f.name}</span>
						<span style={{ position: 'relative', height: 30, borderRadius: 5, background: 'color-mix(in oklch, var(--t-fg) 8%, transparent)' }}>
							<span style={{ position: 'absolute', top: -8, bottom: -8, left: pos(MEDIAN_REACH[0]), width: `${(MEDIAN_REACH[1] - MEDIAN_REACH[0]) * 100}%`, background: 'color-mix(in oklch, var(--t-fg) 26%, transparent)', opacity: on ? 1 : 0, transition: 'opacity 700ms ease' }} />
							<span className="fw-grow" style={{ position: 'absolute', top: 0, bottom: 0, left: pos(f.chrome[0]), width: `${Math.max(0.5, (f.chrome[1] - f.chrome[0]) * 100)}%`, borderRadius: 5, background: 'var(--t-fg)' }} />
							<span style={{ position: 'absolute', top: -8, bottom: -8, left: pos(1), width: 0, borderLeft: '3px dashed var(--t-bg)' }} />
						</span>
						<span style={{ fontFamily: MONO, fontSize: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Math.round(f.chrome[0] * 100)}–{Math.round(f.chrome[1] * 100)}%</span>
					</div>
				))}
			</div>
			<p style={{ marginTop: 22, fontSize: 28, color: 'var(--t-muted)', opacity: on ? 1 : 0, transition: 'opacity 700ms ease' }}>Shaded: the medians of all 21 families we measured, {Math.round(MEDIAN_REACH[0] * 100)}% and {Math.round(MEDIAN_REACH[1] * 100)}%. Seven are shown; we picked the 21 by hand.</p>
		</div>
	)
}

/** One Roboto Flex size from the optical-size measurement: its reach as a bar and as figures. */
function OpszRow({ px, lo, hi, on, strong }: { px: number; lo: number; hi: number; on: boolean; strong?: boolean }) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 330px', alignItems: 'center', gap: 40, opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(16px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
			<p style={display(64)}>{px} px</p>
			<span style={{ position: 'relative', height: 44, borderRadius: 6, background: 'color-mix(in oklch, var(--t-fg) 8%, transparent)' }}>
				<span style={{ position: 'absolute', top: 0, bottom: 0, left: `${(lo - 0.7) / 0.6 * 100}%`, width: `${(hi - lo) / 0.6 * 100}%`, borderRadius: 6, background: strong ? 'var(--t-fg)' : 'var(--t-muted)' }} />
				<span style={{ position: 'absolute', top: -6, bottom: -6, left: '50%', width: 0, borderLeft: '2px dashed var(--t-bg)' }} />
			</span>
			<p style={{ fontFamily: MONO, fontSize: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Math.round(lo * 100)}–{Math.round(hi * 100)}%</p>
		</div>
	)
}

/** One census row: a label, its bar (relative to all families) and its count, revealed with `on`. */
function CensusRow({ label, count, on, strong }: { label: string; count: number; on: boolean; strong?: boolean }) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '760px 1fr', alignItems: 'center', height: 92, opacity: on ? 1 : 0, transition: 'opacity 500ms ease' }}>
			<p style={{ fontSize: 32, fontWeight: strong ? 500 : 300 }}>{label}</p>
			<div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
				<div style={{ width: on ? Math.max(6, (count / CENSUS.families) * 720) : 0, height: 52, borderRadius: 4, background: 'var(--t-fg)', opacity: strong ? 1 : 0.45, transition: 'width 900ms cubic-bezier(.2,.7,.2,1)' }} />
				<p style={display(52)}><CountUp to={count} run={on} ms={900} delay={150} /></p>
			</div>
		</div>
	)
}

/** One strategy's bar in the 336-case result; grows and counts up once revealed. */
function GridBar({ label, note, count, on, strong }: { label: string; note: string; count: number; on: boolean; strong?: boolean }) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', alignItems: 'center', height: 132, opacity: on ? 1 : 0, transition: 'opacity 500ms ease' }}>
			<div>
				<p style={{ fontSize: 38, fontWeight: strong ? 500 : 300 }}>{label}</p>
				<p style={{ fontSize: 30, color: 'var(--t-muted)' }}>{note}</p>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
				<div style={{ width: on ? Math.max(8, (count / GRID_TOTAL.cases) * 760) : 0, height: 64, borderRadius: 6, background: 'var(--t-fg)', opacity: strong ? 1 : 0.5, transition: 'width 900ms cubic-bezier(.2,.7,.2,1)' }} />
				<p style={display(72)}><CountUp to={count} run={on} ms={900} delay={150} /></p>
			</div>
		</div>
	)
}

/**
 * A real Chromium render of one demo row (captured from the local build at 2×), with its caption.
 * Both renders are shown at the same scale (a 459 px box drawn 820 px wide), so their sizes compare honestly.
 */
function Render({ src, alt, height, label, detail }: { src: string; alt: string; height: number; label: string; detail: string }) {
	return (
		<Card style={{ padding: 24, gap: 14 }}>
			{/* eslint-disable-next-line @next/next/no-img-element -- static render captured from the demo; fixed size */}
			<img src={src} alt={alt} width={820} height={height} style={{ width: 820, height, display: 'block' }} />
			<p style={{ fontSize: 26 }}><span style={{ fontWeight: 500 }}>{label}</span> <span style={{ color: 'var(--t-muted)' }}>{detail}</span></p>
		</Card>
	)
}

/** A numbered step card for the recommended order. */
function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
	return (
		<Card style={{ height: '100%', minHeight: 300 }}>
			<Numeral>{n}</Numeral>
			<p style={display(56)}>{title}</p>
			<Body size={32}>{children}</Body>
		</Card>
	)
}

/** Monospace code block in a panel card. */
function Code({ children, size = 30 }: { children: string; size?: number }) {
	return <Card style={{ padding: 40 }}><pre style={{ fontFamily: MONO, fontSize: size, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{children}</pre></Card>
}

/** The slides, in order. Each slide borrows a sibling tool's palette. */
export const SLIDES: Slide[] = [
	{
		id: 'cover', tool: 'fitWidth', steps: 0,
		notes: SCRIPT_NOTES.cover,
		render: () => (
			<div style={{ position: 'absolute', inset: 0, padding: '104px 128px 176px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
				<Eyebrow>A talk · fitWidth</Eyebrow>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
					{/* The talk's subject in one picture: a headline whose width axis can't reach the edge of its box. */}
					<div aria-hidden="true" className="vfd-rise" style={{ ...rise(120), width: 860, padding: '14px 0', borderRadius: 8, border: '2px solid color-mix(in oklch, var(--t-fg) 45%, transparent)', background: 'color-mix(in oklch, var(--t-fg) 5%, transparent)' }}>
						<p className="fw-sweep" style={{ fontFamily: FLEX, fontSize: 150, lineHeight: 1, whiteSpace: 'nowrap', display: 'inline-block' }}>Headline</p>
					</div>
					<Title a="Width, font size, tracking:" b="who really does the fitting?" size={100} />
				</div>
			</div>
		),
		footer: <>Quinn Keaveney · Overpunch, the makers of fitWidth · <A href="https://fitwidth.com">fitwidth.com</A></>,
	},
	{
		id: 'promise', tool: 'hoverBoldly', steps: 1,
		notes: SCRIPT_NOTES.promise,
		render: step => (
			<Frame eyebrow="The idea">
				<Title a="Change the width," b="not the size." />
				<Reveal at={1} step={step}>
					<SmallQuote size={44} q="“Applications may choose to select a width variant in a variable font automatically in order to fit a span of text into a target width.”" who={<span style={{ fontSize: 28 }}>{"OpenType specification, the wdth axis. It goes on: “small, automated 'wdth' adjustments”."}</span>} />
				</Reveal>
			</Frame>
		),
		footer: <><A href={SRC.opentype}>OpenType spec: wdth</A> · <A href={SRC.penney}>Laurence Penney, fit-to-width.js (2018; first shown November 2016)</A></>,
	},
	{
		id: 'census', tool: 'opszStepper', steps: 3,
		notes: SCRIPT_NOTES.census,
		render: step => (
			<Frame eyebrow="Who ships the axis" gap={28}>
				<Title a="97 of 1,950 families" b="have a width axis." size={92} />
				<div>
					<CensusRow label="Google Fonts families" count={CENSUS.families} on />
					<CensusRow label="Variable" count={CENSUS.variable} on={step >= 1} />
					<CensusRow label="With a width axis" count={CENSUS.wdth} on={step >= 2} strong />
					<CensusRow label={`Of those, can’t widen (${CENSUS.notoMaxAt100} are Noto)`} count={CENSUS.maxAt100} on={step >= 3} strong />
				</div>
			</Frame>
		),
		footer: <><A href={SRC.gf}>Google Fonts catalogue metadata</A>, read 7 October 2026 · <A href={SRC.data}>every family and range</A></>,
	},
	{
		id: 'reach', tool: 'vfClamp', steps: 1,
		notes: SCRIPT_NOTES.reach,
		render: step => (
			<div style={{ position: 'absolute', inset: 0, padding: '96px 128px 168px', display: 'flex', flexDirection: 'column', gap: 30 }}>
				<Eyebrow>How far wdth 75–125 moves a headline</Eyebrow>
				<h2 style={display(72)}>
					<span className="vfd-rise" style={{ display: 'inline-block', marginRight: '0.3em', ...rise(90) }}>Half can’t go below 80%.</span>
					<span className="vfd-rise" style={{ display: 'inline-block', fontStyle: 'italic', color: 'var(--t-subtle)', ...rise(200) }}>Half can’t go past 113%.</span>
				</h2>
				<div className="vfd-rise" style={rise(320)}><ReachChart on={step >= 1} /></div>
			</div>
		),
		footer: <>Chromium 149, 72 px, weight 400, mean of five strings · <A href={SRC.data}>all 21 families</A></>,
	},
	{
		id: 'opsz', tool: 'steadyGray', steps: 1,
		notes: SCRIPT_NOTES.opsz,
		render: step => (
			<Frame eyebrow="Roboto Flex · how far wdth 75–125 moves a headline at each size" gap={44}>
				<Title a="In Roboto Flex, the reach" b="shrinks with size." size={92} />
				<div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
					<OpszRow px={OPSZ[6][0]} lo={OPSZ[6][1]} hi={OPSZ[6][2]} on strong />
					<OpszRow px={OPSZ[2][0]} lo={OPSZ[2][1]} hi={OPSZ[2][2]} on={step >= 1} strong />
					<OpszRow px={OPSZ[0][0]} lo={OPSZ[0][1]} hi={OPSZ[0][2]} on={step >= 1} strong />
				</div>
			</Frame>
		),
		footer: <>Chromium 149; the dashed line is natural width · the extreme case of five families with an optical-size axis · <A href={SRC.paper}>paper</A></>,
	},
	{
		id: 'exception', tool: 'ragtooth', steps: 0,
		notes: SCRIPT_NOTES.exception,
		render: () => (
			<Frame eyebrow="Anybody, by Tyler Finck" gap={44}>
				<Title a="Some families have" b="a long width range." size={92} />
				<p aria-hidden="true" className="fw-anybody" style={{ fontFamily: "'FW Anybody', sans-serif", fontWeight: 400, fontSize: 190, lineHeight: 1, whiteSpace: 'nowrap' }}>Anybody</p>
				<Body size={34}>Across its whole axis, 50–150: 37% to 163% of its natural width. Over 75–125: 68% to 132%.</Body>
			</Frame>
		),
		footer: <>Etcetera Type Co, Open Font License · HarfBuzz, 72 px, weight 400 · <A href={SRC.data}>data</A></>,
	},
	{
		id: 'grid', tool: 'opticalMargin', steps: 3,
		notes: SCRIPT_NOTES.grid,
		render: step => (
			<Frame eyebrow="fitWidth on 21 fonts · 16 boxes each, from 0.5× to 2× the headline’s width" gap={24}>
				<Title a="One headline, 336 boxes." size={84} />
				<div>
					<GridBar label="Width axis only" note="wdth 75–125" count={GRID_TOTAL.axis} on={step >= 1} strong />
					<GridBar label="Axis, then tracking" note="the default today, up to ±0.3em" count={GRID_TOTAL.auto} on={step >= 2} />
					<GridBar label="Axis, then font size" note="0.5× to 2×; not released yet" count={GRID_TOTAL.size} on={step >= 3} />
				</div>
			</Frame>
		),
		footer: <>Chromium 149 · 21 of the 75 needed no change (54 of 315 without them) · the boxes end where the size limit does · <A href={SRC.paper}>paper</A></>,
	},
	{
		id: 'tracking', tool: 'fitWidth', steps: 1,
		notes: SCRIPT_NOTES.tracking,
		render: step => (
			<div style={{ position: 'absolute', inset: 0, padding: '96px 128px 176px', display: 'flex', flexDirection: 'column', gap: 28 }}>
				<Eyebrow>Roboto Flex, set at 64 px, in a 459 px box</Eyebrow>
				<h2 style={display(64)}>
					<span className="vfd-rise" style={{ display: 'inline-block', marginRight: '0.3em', ...rise(90) }}>Tracking fits</span>
					<span className="vfd-rise" style={{ display: 'inline-block', fontStyle: 'italic', color: 'var(--t-subtle)', ...rise(200) }}>by pulling the letters apart.</span>
				</h2>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
					<div className="vfd-rise" style={rise(320)}><Render src="/talk/row-auto.png" height={ROW_H.auto} alt="The word Typography fitted with letter-spacing: wide gaps between the letters." label="Axis, then tracking: the default." detail="wdth 125, then +0.2em after every letter." /></div>
					<Reveal at={1} step={step}><Render src="/talk/row-size.png" height={ROW_H.size} alt="The word Typography fitted by font size: normal spacing, larger letters." label="Axis, then font size: not released." detail="wdth 125, then 90.7 px. No added spacing." /></Reveal>
				</div>
			</div>
		),
		footer: <>Real renders from the demo · a box 1.62× the headline’s natural width · Butterick, <A href={SRC.butterick}>Practical Typography</A></>,
	},
	{
		id: 'bug', tool: 'glyphShaper', steps: 1,
		notes: SCRIPT_NOTES.bug,
		render: step => (
			<Frame eyebrow="What testing found" gap={44}>
				<Title a="The last letter" b="misses the edge." />
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
					<Card style={{ minHeight: 320 }}>
						<p style={{ fontSize: 32, color: 'var(--t-muted)' }}>The default, and npm 1.1.0</p>
						<p style={display(120)}><CountUp to={TRAILING.median} decimals={1} /> px</p>
						<Body size={30}>Median gap between the last letter and the edge, in {TRAILING.cases} tracked fits.</Body>
					</Card>
					<Reveal at={1} step={step} style={{ height: '100%' }}>
						<Card style={{ height: '100%', minHeight: 320 }}>
							<p style={{ fontSize: 32, color: 'var(--t-muted)' }}>With the new option, not released</p>
							<p style={display(120)}>0–<CountUp to={0.5} decimals={1} run={step >= 1} /> px</p>
							<Body size={30}>Spacing counted between letters only.</Body>
						</Card>
					</Reveal>
				</div>
			</Frame>
		),
		footer: <>The browser adds letter-spacing after the last letter too · 21 fonts, Chromium 149 · worst cases {Math.abs(TRAILING.min)} px short, {TRAILING.max} px past · <A href={SRC.paper}>paper</A></>,
	},
	{
		id: 'demo', tool: 'fitWidth', steps: 0,
		notes: SCRIPT_NOTES.demo,
		render: () => (
			<Frame eyebrow="Demo" gap={48}>
				<Title a="The same headline," b="fitted four ways." />
				<Body size={36}>Width axis only. Tracking only. Axis, then tracking. Axis, then font size.</Body>
				<p style={display(72)}><A href="https://fitwidth.com/#demo">fitwidth.com</A></p>
			</Frame>
		),
		footer: <>The first three rows are what npm 1.1.0 does; the fourth needs the unreleased size option</>,
	},
	{
		id: 'order', tool: 'textBreath', steps: 3,
		notes: SCRIPT_NOTES.order,
		render: step => (
			<Frame eyebrow="The order we recommend" gap={36}>
				<Title a="Axis, then size," b="then very little tracking." size={92} />
				<ThreeUp step={step}>
					<Step n="01" title="Width axis">The last 10–20%, at the size you set.</Step>
					<Step n="02" title="Font size">Only when the axis runs out. Ours: 0.5× to 2×.</Step>
					<Step n="03" title="Tracking">At most ±0.05em. It overrides the designer’s spacing.</Step>
				</ThreeUp>
				<p style={{ fontFamily: MONO, fontSize: 34 }}>applyFitWidth(el, {'{'} size: true {'}'})</p>
			</Frame>
		),
		footer: <>In the repository and the demo · not the default, and not on npm yet</>,
	},
	{
		id: 'limits', tool: 'typsettle', steps: 2,
		notes: SCRIPT_NOTES.limits,
		render: step => (
			<Frame eyebrow="What it costs" gap={44}>
				<Title a="Size costs height," b="and stops at half and double." size={92} />
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
					<Reveal at={1} step={step} style={{ height: '100%' }}>
						<Card style={{ height: '100%', minHeight: 280 }}>
							<p style={display(56)}>A taller line</p>
							<Body size={34}>64 px became 90.7 px. Whatever sits below it moves.</Body>
						</Card>
					</Reveal>
					<Reveal at={2} step={step} style={{ height: '100%' }}>
						<Card style={{ height: '100%', minHeight: 280 }}>
							<p style={display(56)}>It can lose to the default</p>
							<Body size={34}>At half size it overflows a box that crushed letters would still fit.</Body>
						</Card>
					</Reveal>
				</div>
			</Frame>
		),
		footer: <>Scaled text can also fail WCAG 1.4.4 (Resize Text); we haven’t tested fitted headlines under zoom · <A href={SRC.paper}>paper: limits</A></>,
	},
	{
		id: 'css', tool: 'stabilType', steps: 1,
		notes: SCRIPT_NOTES.css,
		render: step => (
			<Frame eyebrow="The platform’s answer" gap={36}>
				<Title a="CSS is getting text-fit." b="It scales the text." size={92} />
				<Code>{'h1 { text-fit: grow per-line-all 200%; }'}</Code>
				<Reveal at={1} step={step}>
					<SmallQuote q="“They work well only with specific fonts, and they don't offer the flexibility to fit text to any width. So we don't apply them in the initial proposal.”" who={<span style={{ fontSize: 28 }}>Chrome’s layout team, on font-weight or font-width as fit methods: a note in the source of their explainer</span>} />
				</Reveal>
			</Frame>
		),
		footer: <><A href={SRC.text5}>CSS Text Level 5, editor’s draft</A> · Chromium 149: needs experimental web platform features · not approved to ship · <A href={SRC.explainer}>explainer</A></>,
	},
	{
		id: 'close', tool: 'axisRhythm', steps: 0,
		notes: SCRIPT_NOTES.close,
		render: () => (
			<Frame eyebrow="One ask" gap={48}>
				<Title a="Measure the axis" b="before you promise the fit." />
				<Body size={36}>Put your headline and your font into the demo. It shows how far the axis reaches, and what does the rest.</Body>
				<p style={display(88)}><A href="https://fitwidth.com/#demo">fitwidth.com</A></p>
			</Frame>
		),
		footer: <><A href={SRC.paper}>The paper</A> · <A href={SRC.data}>the data</A></>,
	},
	{
		id: 'about', tool: 'opticalMargin', steps: 0,
		notes: SCRIPT_NOTES.about,
		render: () => (
			<div style={{ position: 'absolute', inset: 0, padding: '104px 128px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
				<Eyebrow>About</Eyebrow>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
					<Title a="We’re Overpunch." size={96} />
					<p className="vfd-rise" style={{ ...rise(280), fontSize: 34, lineHeight: 1.45, color: 'var(--t-muted)', maxWidth: 1500 }}>
						Over fifteen years building websites for type foundries. Type tools for the web, fitWidth among them. Building <span style={{ color: 'var(--t-fg)' }}>Typetin</span>, a storefront for independent foundries, in development (<A href="https://typetin.com">typetin.com</A>).
					</p>
				</div>
				<div className="vfd-rise" style={{ ...rise(700), display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
					<p style={display(120)}><A href="https://fitwidth.com">fitwidth.com</A></p>
					<p style={{ fontSize: 26, color: 'var(--t-muted)' }}>The demo · the paper · the data</p>
				</div>
			</div>
		),
	},
]

/** fitWidth's own keyframes: the cover's width sweep, Anybody's full-range sweep and the chart bars (off under reduced motion). */
export const TALK_CSS = `
@keyframes fw-sweep { 0%, 100% { font-variation-settings: "wdth" 75; } 50% { font-variation-settings: "wdth" 125; } }
@keyframes fw-anybody { 0%, 100% { font-variation-settings: "wdth" 50; } 50% { font-variation-settings: "wdth" 150; } }
@keyframes fw-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.fw-sweep { font-variation-settings: "wdth" 100; animation: vfd-rise 700ms cubic-bezier(.2,.7,.2,1) both, fw-sweep 5s ease-in-out 900ms infinite; }
.fw-anybody { font-variation-settings: "wdth" 100; animation: fw-anybody 6s ease-in-out 600ms infinite; }
.fw-grow { transform-origin: left center; animation: fw-grow 900ms cubic-bezier(.2,.7,.2,1) both; }
@media (prefers-reduced-motion: reduce) { .fw-sweep, .fw-anybody, .fw-grow { animation: none; } }
`
