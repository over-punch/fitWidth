// Home page for fitwidth.com: what the tool does, the demo, how it works, its limits and usage.
import Demo from "@/components/Demo"
import Hero from "@/components/Hero"
import CodeBlock from "@/components/CodeBlock"
import { version } from "../../../package.json"
import { version as siteVersion } from "../../package.json"
import SiteFooter from "../components/SiteFooter"
import PortsSection from "../components/PortsSection"

/** JSON-LD structured data for SoftwareApplication rich results */
const jsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "Fit Width",
	description: "Fit a one-line headline to a target width with a variable font's wdth axis, then letter-spacing or font size when the axis runs out.",
	url: "https://fitwidth.com",
	applicationCategory: "DeveloperApplication",
	operatingSystem: "Any",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
}

/** Small tag for options that are in the repository but not in the npm release yet. */
function Next() {
	return <span className="text-[0.65rem] uppercase tracking-[0.18em] text-muted border rounded-full px-2 py-0.5 whitespace-nowrap" style={{ borderColor: 'currentColor' }}>next release</span>
}

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			{/* Hero */}
			<Hero
				eyebrow="width-axis headline fitting"
				title={[{ text: "Fit a headline" }, { text: "to its box.", italic: true, subtle: true }]}
				install="@overpunch/fitwidth"
				github="https://github.com/over-punch/fitWidth"
				tech={["TypeScript", "Zero dependencies", "React + Vanilla JS"]}
			>
				<p className="text-base leading-relaxed max-w-xl">
					Fit Width fits a one-line headline to a target width. It searches the font&rsquo;s <code className="text-sm font-mono">wdth</code> axis first, at the size you set, then closes what is left with letter-spacing.
				</p>
				<p className="text-base leading-relaxed max-w-xl">
					In most fonts the axis is a fine adjustment. Across 21 Google Fonts families with a <code className="text-sm font-mono">wdth</code> axis, values 75&ndash;125 moved a headline to a median of 80% to 113% of its natural width; a few fonts drawn for width reach much further. When a box is further away than the axis can reach, something else is doing the fitting. The demo below shows what, for any headline and box you choose.
				</p>
				<p className="text-sm text-muted leading-relaxed max-w-xl">
					The measurements are written up in a <a href="/paper" className="underline underline-offset-2 hover:text-foreground">paper</a> and a short <a href="/talk" className="underline underline-offset-2 hover:text-foreground">talk</a>, with the <a href="/paper/data" className="underline underline-offset-2 hover:text-foreground">data</a>.
				</p>
			</Hero>

			{/* Demo */}
			<section id="demo" className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4 scroll-mt-28 sm:scroll-mt-20">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">Live demo: one headline, one box, four strategies</h2>
				<div className="rounded-xl -mx-4 sm:-mx-8 px-4 sm:px-8 py-8" style={{ background: "var(--panel)", overflow: 'hidden' }}>
					<Demo />
				</div>
			</section>

			{/* Explanation */}
			<section id="how" className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6 scroll-mt-28 sm:scroll-mt-20">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">How it works</h2>
				<div className="prose-grid grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm leading-relaxed">
					<div className="flex flex-col gap-3">
						<p className="font-semibold text-base">The width axis is a fine adjustment</p>
						<p>A <code className="text-xs font-mono">wdth</code> value is not a percentage of width you can count on. Roboto Flex at <code className="text-xs font-mono">wdth</code> 75 is 83% as wide at 72 px and 96% as wide at 14 px, because its optical size changes the reach. Of the 97 Google Fonts families with a <code className="text-xs font-mono">wdth</code> axis, 49 stop at 100 and can&rsquo;t widen at all. In most of them, plan on the axis for the last 10&ndash;20% of a fit. Fonts drawn for width are the exception: Anybody reaches 68&ndash;132% over the same 75&ndash;125.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold text-base">Three levers, in a fixed order</p>
						<p>First the axis, at the font size you set (default search range 75&ndash;125). Then, only if you turn on <code className="text-xs font-mono">size</code>, font size from 0.5&times; to 2&times; <Next />. Then letter-spacing, capped at &plusmn;0.3em, or &plusmn;0.05em when <code className="text-xs font-mono">size</code> is on. <code className="text-xs font-mono">prefer</code> can restrict it to the axis or to tracking alone.</p>
						<p>The package&rsquo;s default stops at the axis and tracking: font size never changes unless you ask. We think font size is the better second step, because it leaves the designer&rsquo;s spacing and ligatures alone, and we recommend turning <code className="text-xs font-mono">size</code> on once it is released. It costs height, and it is not a superset of tracking: at its 0.5&times; floor it can overflow a box that &minus;0.3em of tracking would squeeze into.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold text-base">It measures a hidden copy</p>
						<p>Each stage is a binary search of about 20 measurements on a hidden copy of your element, placed beside it so it renders the same way (nested markup, your own spacing, <code className="text-xs font-mono">text-transform</code>). The visible element is written once, at the end. <code className="text-xs font-mono">useFitWidth</code> and <code className="text-xs font-mono">FitWidthText</code> refit on container resize and when fonts load.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold text-base">It tells you when it can&rsquo;t</p>
						<p>A fit&rsquo;s measured (advance) width is never wider than its target and at most <code className="text-xs font-mono">tolerance</code> (0.5 px) narrower; a letter&rsquo;s ink can overhang that by a few pixels, as in any text. When the ranges you allow can&rsquo;t reach the target, the text is left short or overflowing; it isn&rsquo;t forced. An overflow prints a console warning, once for each combination of levers; falling short prints nothing. From the next release <code className="text-xs font-mono">applyFitWidth</code> also returns what each stage did for every fit, which is what the demo prints <Next />.</p>
					</div>
				</div>
				<div className="flex flex-col gap-3 text-sm leading-relaxed">
					<p className="font-semibold text-base">Limits</p>
					<ul className="list-disc pl-5 flex flex-col gap-1.5">
						<li>One line only. A <code className="text-xs font-mono">&lt;br&gt;</code> makes two lines and the fit follows the longer one.</li>
						<li>The font must be loaded before the vanilla API runs; a fit measured in a fallback font is wrong. Call it after <code className="text-xs font-mono">document.fonts.ready</code>. The hook and component do this for you.</li>
						<li>Values outside a font&rsquo;s own <code className="text-xs font-mono">wdth</code> range are clamped by the browser, so searching 75&ndash;125 in a font that has 75&ndash;100 finds nothing above 100.</li>
						<li>Any non-zero letter-spacing turns off a font&rsquo;s ligatures. If your headline has one (an &ldquo;fi&rdquo;, say), the width jumps when tracking starts, and a target inside that jump can&rsquo;t be reached by tracking.</li>
						<li>At &minus;0.3em letters can collide. Lower <code className="text-xs font-mono">maxTracking</code> if a narrow box is possible.</li>
						<li>In npm 1.1.0, a fit that adds tracking counts the space the browser puts after the last letter, so the last letter ends short of the edge by the tracking amount (or past it, with negative tracking): a median of 9 px off in our 21-font test, and up to 20 px. The repository fixes this, so the demo already shows the corrected behaviour: the third row is the default&rsquo;s order of steps, not 1.1.0&rsquo;s exact output <Next />. The fix cancels the trailing space with a right margin; inside a container with <code className="text-xs font-mono">overflow: auto</code> that space can still count as scrollable width, so use <code className="text-xs font-mono">overflow: hidden</code> or <code className="text-xs font-mono">clip</code> there.</li>
						<li>The search assumes the axis widens the text as its value rises. An axis that doesn&rsquo;t (<code className="text-xs font-mono">opsz</code>) won&rsquo;t converge.</li>
						<li><code className="text-xs font-mono">size</code> changes the element&rsquo;s height. Text that is scaled to fit is also a known way to fail WCAG 1.4.4 (Resize Text); the CSS Working Group is discussing a default 200% limit for that reason, and <code className="text-xs font-mono">size: true</code> stops at 2&times;.</li>
					</ul>
				</div>
				<div className="flex flex-col gap-3 text-sm leading-relaxed">
					<p className="font-semibold text-base">When CSS is the simpler choice</p>
					<p>If you only want the text scaled to the box, you may not need a script. The CSS <code className="text-xs font-mono">text-fit</code> property (CSS Text Level 5 draft) does it natively. In Chromium 149 it works only with experimental web platform features turned on, so today a fluid <code className="text-xs font-mono">font-size</code> in container units gets you close without JavaScript. Fit Width is for the case those don&rsquo;t cover: holding the size you set and letting the font&rsquo;s own widths take up the slack.</p>
					<CodeBlock code={`/* Scales the line up to fill its container (CSS Text Level 5 draft).
   Chromium 149: behind "experimental web platform features". */
h1 { text-fit: grow per-line-all 200%; }`} />
				</div>
			</section>

			{/* Usage */}
			<section id="usage" className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6 scroll-mt-28 sm:scroll-mt-20">
				<div className="flex items-baseline gap-4">
					<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">Usage</h2>
					<p className="text-xs text-muted tracking-wide">TypeScript + React · Vanilla JS</p>
				</div>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="text-muted">Drop-in component</p>
						<CodeBlock code={`import { FitWidthText } from '@overpunch/fitwidth'

<FitWidthText as="h1" style={{ whiteSpace: 'nowrap' }}>
  Display Headline
</FitWidthText>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-muted">Hook: attach to any element</p>
						<CodeBlock code={`import { useFitWidth } from '@overpunch/fitwidth'

const ref = useFitWidth({ axisMin: 75, axisMax: 100 }) // your font's own wdth range
<h1 ref={ref}>Display Headline</h1>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-muted">Vanilla JS</p>
						<CodeBlock code={`import { applyFitWidth, removeFitWidth } from '@overpunch/fitwidth/core'

const el = document.querySelector('h1')
await document.fonts.ready
applyFitWidth(el)

// Restore original styles
removeFitWidth(el)`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-muted flex flex-wrap items-center gap-2">Let font size take over, and read what the fit did <Next /></p>
						<CodeBlock code={`// In the repository now; not in the npm release (1.1.0) yet.
const result = applyFitWidth(el, { size: true })

result.status   // 'fit' | 'short' | 'overflow'
result.ratios   // { axis: 1.17, size: 1.39, tracking: 1 }  width multipliers
result.limits   // { axis: 'max', size: null, tracking: null }`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-muted">Options</p>
						<table className="w-full text-xs" aria-label="FitWidth options reference">
							<thead>
								<tr className="text-muted text-left">
									<th scope="col" className="pb-2 pr-6 font-normal">Option</th>
									<th scope="col" className="pb-2 pr-6 font-normal">Default</th>
									<th scope="col" className="pb-2 font-normal">Description</th>
								</tr>
							</thead>
							<tbody className="text-muted zebra">
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">target</td><td className="py-2 pr-6">&apos;container&apos;</td><td className="py-2">Width to fit: <code className="font-mono">&apos;container&apos;</code> (the parent&apos;s content box, without padding or borders), a number of px, or an HTMLElement.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">prefer</td><td className="py-2 pr-6">&apos;auto&apos;</td><td className="py-2"><code className="font-mono">&apos;auto&apos;</code>: the axis first, then letter-spacing. <code className="font-mono">&apos;axis&apos;</code>: the axis only. <code className="font-mono">&apos;tracking&apos;</code>: letter-spacing only.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">axis</td><td className="py-2 pr-6">&apos;wdth&apos;</td><td className="py-2">Variable font axis tag to search. It must widen the text as its value rises.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">axisMin</td><td className="py-2 pr-6">75</td><td className="py-2">Lowest axis value searched. Set it to your font&apos;s own minimum if that is higher.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">axisMax</td><td className="py-2 pr-6">125</td><td className="py-2">Highest axis value searched. Set it to your font&apos;s own maximum if that is lower.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">maxTracking</td><td className="py-2 pr-6">0.3</td><td className="py-2">Most letter-spacing the fit may add or remove, in em, on top of your own. Next release: 0.05 when <code className="font-mono">size</code> is on.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">tolerance</td><td className="py-2 pr-6">0.5</td><td className="py-2">How many px narrower than the target a fit may be. It is never wider.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">size</td><td className="py-2 pr-6">false</td><td className="py-2">Next release. <code className="font-mono">true</code> lets font size go from 0.5&times; to 2&times; when the axis runs out; <code className="font-mono">{'{ min, max }'}</code> sets your own multipliers.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">onFit</td><td className="py-2 pr-6">none</td><td className="py-2">Next release. Called after each fit with the result: widths, the value each stage ended on, and whether the text fits.</td></tr>
								<tr className="hover:bg-foreground/5 transition-colors"><td className="py-2 pr-6 font-mono">respectReducedMotion</td><td className="py-2 pr-6">false</td><td className="py-2">When true, skips fitting if the user has enabled prefers-reduced-motion.</td></tr>
							</tbody>
						</table>
						<p className="text-xs text-muted mt-3"><code className="font-mono">FitWidthText</code> only: <code className="font-mono">as</code> (default <code className="font-mono">&apos;h1&apos;</code>), the HTML element to render.</p>
					</div>
				</div>
			</section>

			<PortsSection
				npm="@overpunch/fitwidth"
				bundle="fitwidth"
				attr="data-fitwidth" figma="partial"
				framerComponent="FitWidth"
				repo="over-punch/FitWidth"
			/>

			<SiteFooter current="fitWidth" npmVersion={version} siteVersion={siteVersion} />

		</main>
	)
}
