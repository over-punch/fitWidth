# fitWidth

[![npm](https://img.shields.io/npm/v/%40overpunch%2Ffitwidth.svg)](https://www.npmjs.com/package/@overpunch/fitwidth) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/over-punch/type-tools)

`fitWidth` fits a one-line headline to a target width. It binary-searches the font's `wdth` axis first, at the font size you set, then closes what is left with `letter-spacing`. From 1.2.0 it can also let font size take over (`size: true`), and it returns what each step did.

**How far the axis reaches.** In 21 Google Fonts families measured in Chromium at 72 px, half couldn't take a headline below 80% of its natural width over `wdth` 75–125, and half couldn't take it past 113%; 6 of the 21 can't widen at all. Families with a long width range (Anybody, Georama, Anek Latin) go much further. With the width axis alone, the fit reached 75 of 336 font-and-target cases (targets from 0.5× to 2× natural width). So treat the axis as the last 10–20% of a fit, and decide what does the rest: tracking (the default) or font size (`size`). Method and data: [fitwidth.com/paper](https://fitwidth.com/paper).

The idea of fitting with the width axis is Laurence Penney's: see his [fit-to-width.js](https://github.com/Lorp/fit-to-width) (2018).

<img src="https://raw.githubusercontent.com/over-punch/fitWidth/main/assets/hero.png?v=1" alt="The word Typography rendered at one font size in three containers of decreasing width — 100%, 64%, and 40% — each filled flush to the edge by condensing the wdth variable font axis." width="100%">

**[▶ Try the live demo at fitwidth.com](https://fitwidth.com)** — drag a slider and watch headlines re-fit in real time.

[npm](https://www.npmjs.com/package/@overpunch/fitwidth) · [GitHub](https://github.com/over-punch/fitWidth)

TypeScript · Zero dependencies · React + Vanilla JS

---

## Install

```bash
npm install @overpunch/fitwidth
```

**Requirements:** any modern browser. The core relies on `getBoundingClientRect`, `font-variation-settings`, and (for live re-fitting) `ResizeObserver` and `document.fonts.ready` — all available in current Chrome, Edge, Firefox, and Safari. React is an optional peer dependency (`>=17`). The main entry also exports the hook and component, so it imports `react`; without React installed, import the vanilla API from the React-free subpath: `import { applyFitWidth } from '@overpunch/fitwidth/core'`.

---

## Usage

> **Next.js App Router:** this library uses browser APIs. Add `"use client"` to any component file that imports from it.

> **A font with a `wdth` axis:** for example [Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex) (25–151), [Anybody](https://fonts.google.com/specimen/Anybody) (50–150) or [Archivo](https://fonts.google.com/specimen/Archivo) (62–125). Check your font's real range and pass it as `axisMin`/`axisMax`: the browser clamps values outside it, so the default 75–125 search finds nothing above 100 in a font that stops at 100 (Roboto, Open Sans, Noto Sans and 46 more on Google Fonts). Inter and Recursive have no `wdth` axis. Without one, the axis step does nothing and `letter-spacing` (or `size`) does the whole fit.

> **Single line, single element:** `fitWidth` fits one display element to one target width — a headline, masthead, or pull-quote on a single line. It does not wrap or re-flow multi-line body copy, and it never splits content into per-word or per-line spans. Keep the element on one line (`white-space: nowrap`) for predictable results.

### React component

```tsx
import { FitWidthText } from '@overpunch/fitwidth'

<FitWidthText as="h1" axis="wdth" axisMin={75} axisMax={125}>
  The quick brown fox
</FitWidthText>
```

The default `as` element is `'h1'`. Pass any valid HTML element type — `'h2'`, `'p'`, `'div'` — to render a different tag.

### React hook

```tsx
import { useFitWidth } from '@overpunch/fitwidth'

// Inside a React component:
const ref = useFitWidth({ axis: 'wdth', axisMin: 75, axisMax: 125 })
return <h1 ref={ref}>The quick brown fox</h1>
```

The hook re-runs automatically on resize via `ResizeObserver` and after fonts finish loading via `document.fonts.ready`. It cleans up the observer on unmount.

### Vanilla JS

```ts
import { applyFitWidth, removeFitWidth } from '@overpunch/fitwidth'

const el = document.querySelector('h1')
const opts = { axis: 'wdth', axisMin: 75, axisMax: 125 }

function run() {
  applyFitWidth(el, opts)
}

run()
document.fonts.ready.then(run)

let ro = new ResizeObserver(() => run())
ro.observe(el)

// Later — disconnect and restore original inline styles:
// ro.disconnect()
// removeFitWidth(el)
```

### TypeScript

```ts
import type { FitWidthOptions } from '@overpunch/fitwidth'

const opts: FitWidthOptions = {
  target: 'container',
  prefer: 'auto',
  axis: 'wdth',
  axisMin: 75,
  axisMax: 125,
  maxTracking: 0.3,
  tolerance: 0.5,
}
```

### Font size, and what the fit did (1.2.0)

> **1.2.0 is not on npm yet.** npm has 1.1.0. Everything marked *(1.2.0)* below is in this repository and runs on [fitwidth.com](https://fitwidth.com); the defaults are unchanged from 1.1.0.

```ts
import { applyFitWidth, type FitWidthResult } from '@overpunch/fitwidth'

// The axis first; font size (0.5×–2×) only if the axis range can't reach; then at most ±0.05em of tracking.
const result = applyFitWidth(el, { size: true }) as FitWidthResult

result.status    // 'fit' | 'short' | 'overflow'
result.natural   // width as authored, px
result.width     // width after the fit, px
result.axisValue // e.g. 125
result.fontSize  // px
result.tracking  // em added
result.ratios    // { axis: 1.17, size: 1.39, tracking: 1 }: width multipliers; their product is width / natural
result.limits    // { axis: 'max', size: null, tracking: null }: where each stage ended
result.trimmed   // true when trimTrailingSpace was applied
```

`applyFitWidth` returns `null` when it fits nothing (no window, empty text, invalid options, reduced motion). `onFit` receives the same object after every fit, including refits from the React hook.

---

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `target` | `'container'` | Width to fill. `'container'` fills the parent's content box (padding and borders excluded, sub-pixel, and correct inside a scaled parent). Pass a `number` for an exact pixel target. Pass an `HTMLElement` to match another element's content width. `null` (a React ref not attached yet) means `'container'` |
| `prefer` | `'auto'` | Strategy to use. `'auto'` tries the `wdth` axis first, then refines with `letter-spacing` if needed. `'axis'` uses the axis only (no tracking is added; your own `letter-spacing` is kept). It warns if the axis doesn't change the font's width. `'tracking'` uses `letter-spacing` only and leaves `font-variation-settings` unchanged |
| `axis` | `'wdth'` | Variable font axis tag to adjust when `prefer` is `'auto'` or `'axis'`. Any four-character OpenType axis tag is valid (e.g. `'wdth'`, `'wght'`, `'XTRA'`) |
| `axisMin` | `75` | Minimum axis value for the binary search |
| `axisMax` | `125` | Maximum axis value for the binary search |
| `maxTracking` | `0.3` (`0.05` with `size`) | Maximum absolute `letter-spacing` in em, added to your own letter-spacing. The result is clamped to ±this value. At −0.3em glyphs can collide; lower it if a narrow container is possible |
| `size` | `false` | *(1.2.0)* Let font size take over when the axis range runs out. `true` allows 0.5× to 2× the element's own size; `{ min, max }` sets your own multipliers. Writes `font-size` inline in px (restored by `removeFitWidth`), carries your letter-spacing in em so it scales, and changes the element's height. Off by default: font size is never changed unless you ask |
| `trimTrailingSpace` | `false` | *(1.2.0)* Browsers add letter-spacing after the last letter too, and the fit counts it, so a tracked fit's last letter ends short of the target by the tracking amount (or past it, with negative tracking). With this option the fit counts spacing between letters only and cancels the trailing space with an inline `margin-right`. It is applied only to elements that size themselves to their text (`display: inline-block` or another inline-level display, a float, or absolutely positioned) and that end in their own text; elsewhere it is ignored with a console warning. Give a scrolling container `overflow: hidden` or `clip`. Not for joined scripts such as Arabic |
| `onFit` | none | *(1.2.0)* Called after every fit with the `FitWidthResult` |
| `tolerance` | `0.5` | Convergence tolerance in pixels. When the ranges can reach the target, the element's measured width is never wider than it and at most this much narrower, so a heading without `white-space: nowrap` doesn't wrap. `0` can't generally be met: a search lands near a value, not on it |
| `respectReducedMotion` | `false` | When `true`, checks `prefers-reduced-motion: reduce` before fitting. If the user has enabled reduced motion, `applyFitWidth` returns early without modifying any styles. The React hook also listens for OS-level changes to the preference and re-evaluates automatically |
| `as` | `'h1'` | HTML element to render. Accepts any valid React element type. *(React component only)* |

---

## How it works

`applyFitWidth` closes the gap between a headline and its container, as far as the ranges you allow can reach. A fit's measured (advance) width is never wider than the target and at most `tolerance` narrower; past the ranges, the text stays short or overflows and the result says so. The ink sits a few pixels inside that width, depending on the first and last letters' sidebearings.

<img src="https://raw.githubusercontent.com/over-punch/fitWidth/main/assets/before-after.png?v=1" alt="The same headline Display Type in two identical containers: above, plain CSS leaves a large gap on the right; below, applyFitWidth expands the wdth axis so the text reaches both edges." width="100%">

**Binary search algorithm:** `applyFitWidth` measures a hidden copy of the element placed beside it in the same parent, so the copy renders as the element does: nested markup, your letter-spacing and word-spacing, `text-transform`, `white-space`, `font-size-adjust` and any transform on the parent. From 1.2.0 the copy also carries the element's computed font styles, so a rule that reaches the element by `id`, `:first-child` or `:only-child` still applies (in 1.1.0 such a headline was measured in the wrong font). Descendants styled by `id` are still not matched in the copy. It bisects the search space up to 20 times per pass, changing only the copy, then writes the visible element once. The loop exits early once the text fits within `tolerance` pixels of the target.

**Limits:**
- The axis must widen the text as its value rises (`wdth`, `XTRA`, often `wght`). An axis that doesn't (`opsz`) won't converge.
- Text that is still too wide at the ends of the ranges you allow overflows, with a console warning; text still too narrow is left short. From 1.2.0 the result's `status` says which.
- Any non-zero `letter-spacing` turns off a font's standard ligatures. A headline with some (Advent Pro's "tt" and "fi" in "Headline fitting" at 72 px) jumps 11.7 px wider when tracking starts, so a target inside that jump can't be reached by tracking (`limits.tracking` is `'stepped'`). Font size keeps the ligatures.
- A tracked fit's last letter ends short of the target by the tracking amount, because browsers add the spacing after it too: a median of 8.5 px, and up to 22 px, in a 21-font test. See `trimTrailingSpace` (1.2.0).
- The search assumes width rises with the axis value. A few fonts break that for some letters: in Mona Sans, "illicit" gets narrower above `wdth` 100, and the axis step ends on the wrong side.
- Width also changes stroke weight and proportion in most families. Headlines fitted to very different widths, seen together, can read as different fonts.
- A font size set with `!important` in a stylesheet beats the inline size `size` writes: the fit warns, and the result's `fontSize` is then the size it asked for.
- With an optical-size axis, width isn't proportional to font size or to `wdth`: Roboto Flex at `wdth` 75 is 83% as wide at 72 px and 96% as wide at 14 px.
- Text scaled to fit can fail WCAG 1.4.4 (Resize Text). `size: true` stops at 2×; keep a limit, and test under zoom (we haven't).
- `fitWidth` fits a single line. A `<br>` makes the text two lines, and the fit then follows the longer line.
- The vanilla API measures whichever font is loaded when it runs: call it after `document.fonts.ready`.

**`prefer: 'auto'` strategy:** The axis search runs first, at the font size you set. If the best axis value still leaves a gap larger than `tolerance` (the target is outside the axis range), font size is searched next when `size` is on, and then `letter-spacing` closes what remains, up to `maxTracking`. The axis goes first because its widths were drawn by the type designer; tracking goes last because it is the only step that changes the spacing they set.

The three `prefer` modes fill the same width by different means — `'axis'` widens the glyphs themselves, `'tracking'` widens the gaps between them, and `'auto'` uses the axis first and only falls back to tracking when the axis range runs out:

<img src="https://raw.githubusercontent.com/over-punch/fitWidth/main/assets/prefer-modes.png?v=1" alt="The word Headline fitted to one width three ways: prefer axis gives wider letterforms, prefer tracking keeps the default letterforms with wider spacing between them, and prefer auto uses the wdth axis." width="100%">

**No innerHTML rewriting:** Unlike line-based tools in this suite, `fitWidth` operates on a single element and never wraps content in spans or rewrites `innerHTML`. It modifies only `el.style.fontVariationSettings` and `el.style.letterSpacing` (plus `el.style.fontSize` when `size` is on, and `el.style.marginRight` when `trimTrailingSpace` applies). The original inline values are saved in a `WeakMap` on the first call; subsequent calls reset from those saved values before re-fitting, making repeated invocations idempotent. If you (or a framework re-render) change either value after a fit, the new value becomes the original. `removeFitWidth` restores the saved originals, leaves no empty `style` attribute behind, and clears the entry.

**ResizeObserver built in:** The React hook and Vanilla JS example both observe the container with `ResizeObserver`. The hook also refits when the element's text changes, and follows the element if React replaces it (a conditional remount, or a changed `as`). The Webflow embed refits on container resizes, late font loads and `[data-fitwidth]` elements added after the page loads; `data-fw-target` also accepts a percentage of the container, `data-fw-size` turns on font size (`"true"`, or a range such as `"0.6-1.5"`; 1.2.0), `data-fw-trim="true"` turns on `trimTrailingSpace` (1.2.0), and `data-fitwidth="false"` opts out. Callbacks are debounced with `requestAnimationFrame` and deduplicated by integer pixel width — the fit only re-runs when the container actually changes width.

**`document.fonts.ready` timing:** Browser width measurements before a web font loads return metrics for the fallback font, producing an incorrect fit. The hook and Vanilla JS example both call `document.fonts.ready.then(run)` to re-run once the real font is available.

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.

---

## Future improvements

- **Multi-element sync** — accept an array of elements and fit them all to the same computed target width in a single pass, so a stack of pull-quotes share identical tracking
- **Read the font's own axis range** — clamp `axisMin`/`axisMax` to the range in the font's `fvar` table, so the reported axis value is always one the font renders
- **Framer controls for `size` and `trimTrailingSpace`** — the Framer component doesn't expose them yet
- **A different tracking cap for capitals and lowercase**, and word-spacing before letter-spacing for multi-word lines
- **A non-monotonic axis** — notice when width falls as the axis value rises, and keep the better end
- **SSR hydration hint** — accept a pre-computed `axisValue` prop that is applied immediately on mount before the first `ResizeObserver` fires, eliminating the brief unstyled state on first render
- **Canvas-based width measurement** — use `CanvasRenderingContext2D.measureText()` as a non-layout measurement path to avoid forced reflow on every resize cycle, with BCR as the fallback for accuracy
