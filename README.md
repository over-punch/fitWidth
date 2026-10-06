# fitWidth

[![npm](https://img.shields.io/npm/v/%40overpunch%2Ffitwidth.svg)](https://www.npmjs.com/package/@overpunch/fitwidth) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/over-punch/type-tools)

CSS has no native way to stretch or compress a display headline to fill an exact container width without changing font-size. `fitWidth` binary-searches the `wdth` variable font axis — and falls back to `letter-spacing` — to close that gap precisely. Type size stays constant; only inter-glyph geometry changes.

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

> **Variable font recommended:** `fitWidth` works best with a variable font that has a `wdth` axis — for example [Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex), [Recursive](https://fonts.google.com/specimen/Recursive), or [Inter](https://fonts.google.com/specimen/Inter). When a `wdth` axis is available, `prefer: 'auto'` uses it for the main fit and refines with `letter-spacing` only if needed. With a static font, the algorithm falls back to `letter-spacing` alone (`prefer: 'tracking'`) — the result is functional but typographically coarser.

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

---

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `target` | `'container'` | Width to fill. `'container'` fills the parent's content box (padding and borders excluded, sub-pixel, and correct inside a scaled parent). Pass a `number` for an exact pixel target. Pass an `HTMLElement` to match another element's content width. `null` (a React ref not attached yet) means `'container'` |
| `prefer` | `'auto'` | Strategy to use. `'auto'` tries the `wdth` axis first, then refines with `letter-spacing` if needed. `'axis'` uses the axis only (no tracking is added; your own `letter-spacing` is kept). It warns if the axis doesn't change the font's width. `'tracking'` uses `letter-spacing` only and leaves `font-variation-settings` unchanged |
| `axis` | `'wdth'` | Variable font axis tag to adjust when `prefer` is `'auto'` or `'axis'`. Any four-character OpenType axis tag is valid (e.g. `'wdth'`, `'wght'`, `'XTRA'`) |
| `axisMin` | `75` | Minimum axis value for the binary search |
| `axisMax` | `125` | Maximum axis value for the binary search |
| `maxTracking` | `0.3` | Maximum absolute `letter-spacing` in em, added to your own letter-spacing. The result is clamped to ±this value. At −0.3em glyphs can collide; lower it if a narrow container is possible |
| `tolerance` | `0.5` | Convergence tolerance in pixels. The fitted text is never wider than the target, and at most this much narrower, so a heading without `white-space: nowrap` doesn't wrap |
| `respectReducedMotion` | `false` | When `true`, checks `prefers-reduced-motion: reduce` before fitting. If the user has enabled reduced motion, `applyFitWidth` returns early without modifying any styles. The React hook also listens for OS-level changes to the preference and re-evaluates automatically |
| `as` | `'h1'` | HTML element to render. Accepts any valid React element type. *(React component only)* |

---

## How it works

CSS leaves a display headline ragged inside its container; `applyFitWidth` closes the gap so the headline sits flush to both edges — same font, same size.

<img src="https://raw.githubusercontent.com/over-punch/fitWidth/main/assets/before-after.png?v=1" alt="The same headline Display Type in two identical containers: above, plain CSS leaves a large gap on the right; below, applyFitWidth expands the wdth axis so the text reaches both edges." width="100%">

**Binary search algorithm:** `applyFitWidth` measures a hidden copy of the element placed beside it in the same parent, so the copy renders exactly as the element does: nested markup, your letter-spacing and word-spacing, `text-transform`, `white-space`, `font-size-adjust` and any transform on the parent. It bisects the search space up to 20 times per pass, changing only the copy, then writes the visible element once. The loop exits early once the text fits within `tolerance` pixels of the target.

**Limits:**
- The axis must widen the text as its value rises (`wdth`, `XTRA`, often `wght`). An axis that doesn't (`opsz`) won't converge.
- Text that is still too wide at the ends of the axis and tracking ranges overflows, with a console warning.
- `fitWidth` fits a single line. A `<br>` makes the text two lines, and the fit then follows the longer line.
- The vanilla API measures whichever font is loaded when it runs: call it after `document.fonts.ready`.

**`prefer: 'auto'` strategy:** The axis search runs first. If the best axis value still leaves a gap larger than `tolerance` — because the target is outside the font's axis range — a second binary search over `letter-spacing` runs from the current position to close the remaining difference. Axis variation is always preferred over tracking when available, because it preserves the designer's intended glyph shapes.

The three `prefer` modes fill the same width by different means — `'axis'` widens the glyphs themselves, `'tracking'` widens the gaps between them, and `'auto'` uses the axis first and only falls back to tracking when the axis range runs out:

<img src="https://raw.githubusercontent.com/over-punch/fitWidth/main/assets/prefer-modes.png?v=1" alt="The word Headline fitted to one width three ways: prefer axis gives wider letterforms, prefer tracking keeps the default letterforms with wider spacing between them, and prefer auto uses the wdth axis." width="100%">

**No innerHTML rewriting:** Unlike line-based tools in this suite, `fitWidth` operates on a single element and never wraps content in spans or rewrites `innerHTML`. It modifies only `el.style.fontVariationSettings` and `el.style.letterSpacing`. The original inline values are saved in a `WeakMap` on the first call; subsequent calls reset from those saved values before re-fitting, making repeated invocations idempotent. If you (or a framework re-render) change either value after a fit, the new value becomes the original. `removeFitWidth` restores the saved originals, leaves no empty `style` attribute behind, and clears the entry.

**ResizeObserver built in:** The React hook and Vanilla JS example both observe the container with `ResizeObserver`. The hook also refits when the element's text changes, and follows the element if React replaces it (a conditional remount, or a changed `as`). The Webflow embed refits on container resizes, late font loads and `[data-fitwidth]` elements added after the page loads; `data-fw-target` also accepts a percentage of the container, and `data-fitwidth="false"` opts out. Callbacks are debounced with `requestAnimationFrame` and deduplicated by integer pixel width — the fit only re-runs when the container actually changes width.

**`document.fonts.ready` timing:** Browser width measurements before a web font loads return metrics for the fallback font, producing an incorrect fit. The hook and Vanilla JS example both call `document.fonts.ready.then(run)` to re-run once the real font is available.

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.

---

## Future improvements

- **Multi-element sync** — accept an array of elements and fit them all to the same computed target width in a single pass, so a stack of pull-quotes share identical tracking
- **Clamped overshoot mode** — instead of converging to exactly `targetWidth`, allow the user to specify a `minFill` ratio (e.g. `0.98`) so the algorithm stops as soon as the line reaches 98 % of the target, avoiding aggressive tracking on very short words
- **SSR hydration hint** — accept a pre-computed `axisValue` prop that is applied immediately on mount before the first `ResizeObserver` fires, eliminating the brief unstyled state on first render
- **Canvas-based width measurement** — use `CanvasRenderingContext2D.measureText()` as a non-layout measurement path to avoid forced reflow on every resize cycle, with BCR as the fallback for accuracy
