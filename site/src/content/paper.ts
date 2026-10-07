// Public text of the paper "Width, Font Size, Tracking: Who Really Does the Fitting?" (markdown subset rendered by components/talk/Prose.tsx).

/** Paper body in markdown. {{figure:name}} lines are replaced by figures on the page. */
export const PAPER_MD = `
A variable font's width axis looks like the right tool for fitting a headline to its box. This paper measures how far that axis reaches in the fonts people can get today, tests our own library against those fonts, and reports a bug it had. The short answer: in most fonts the axis is a fine adjustment, and something else does the fitting.

*Disclosure: the authors make [fitWidth](https://fitwidth.com) and other type tools for the web, have built websites for type foundries for over fifteen years, and are building [Typetin](https://typetin.com), a storefront platform for independent foundries (in development, not yet launched). The measurements use open tools (HarfBuzz, fontTools, Chromium) and open fonts. Our first recommendation doesn't need our library, and the order we argue for is not yet in its npm release.*

## Summary

Of 1,950 families on Google Fonts, 97 have a width axis (\`wdth\`). In 49 of those the axis stops at 100, so it can narrow a headline but can't widen it.

We measured 21 of the 97 in Chromium. Over \`wdth\` 75–125, fitWidth's default search range, a headline moved to a median of **80% of its natural width at the narrow end and 113% at the wide end**. Those are two separate medians; no single font has exactly that range. A few fonts drawn for width go much further.

We then asked our library to fit one headline in each of the 21 fonts to 16 target widths, from half to double its natural width. The axis alone fitted **75 of 336**. Remove the 21 targets where nothing has to move, and it is 54 of 315.

So when a box is further away than the axis can reach, something else is doing the fitting. In fitWidth's released default that is letter-spacing. We now think it should be font size, with letter-spacing held to a small cap. That order is in the repository and the demo; it is not the default and it is not on npm yet.

## The promise

The idea is in the OpenType specification itself. The registration of the width axis says:

> Applications may choose to select a width variant in a variable font automatically in order to fit a span of text into a target width.

The same page is careful about scale: applications "may choose to make small, automated 'wdth' adjustments", and the change in value "may be used as a first approximation".

The CSS Working Group heard the request early. On the 2018 issue asking for text that always fits its parent, Sergey Malkin wrote: "Changing font-stretch, especially using variable fonts, is another way to fit text into parent." Seven years later Peter Constable noted in the same thread: "Since OpenType Font Variations was introduced in 2016, the idea of manipulating the 'wdth' axis of variable fonts to fit text to a target width has often been raised."

Often raised, and rarely measured. The popular fit-text libraries don't use the axis at all: the READMEs of fitty, textFit, FitText.js and BigText describe fitting by font size (BigText adds word-spacing), and none mentions \`wdth\`, \`font-stretch\` or variable fonts.

## Who ships a width axis

We read the Google Fonts catalogue metadata on 7 October 2026.

| | Families |
|---|---|
| All families | 1,950 |
| Variable | 561 |
| With a \`wdth\` axis | 97 |
| Axis stops at 100 (can't widen) | 49, of which 37 are Noto |
| Axis starts at 100 (can't narrow) | 8 |
| Covers all of 75–125 | 37 |
| Exactly 75–125 | 24 |

The median axis spans 37.5 units. The most common range is 62.5–100 (the Noto families); the next is 75–125. Every family and its range is on the [data page](/paper/data).

This is one catalogue of free fonts. Retail families may be drawn with wider ranges; we didn't measure any.

## How far the axis reaches

A \`wdth\` value reads like a percentage, and the specification says values "can be interpreted as a percentage of whatever the font designer considers “normal width”". In practice it is the designer's label for a design, not a measurement.

We took 21 of the 97 families and shaped five headline strings in each at \`wdth\` 75, 100 and 125 (or as close as the font allows), at 72 px and weight 400.

{{figure:reach}}

- Median reach: 80.0% to 113.1% of the width at \`wdth\` 100.
- 6 of the 21 can't widen. 8 span less than 30 points; 5 span less than 20.
- At the ends of each font's own range, the measured width differed from the \`wdth\` number by a median of 9 points. Mona Sans at 125 is 107% wide. IBM Plex Sans at 75 is 90%. Only Inconsolata, a monospace, maps exactly.
- HarfBuzz and Chromium agreed within 0.10% across all 315 widths.

The 21 were picked by hand to cover well-known families, and the sample is kinder to the axis than the whole set: 6 of these 21 can't widen, against 49 of the 97.

## The reach changes with size

In a font with an optical-size axis, the width axis doesn't even reach the same distance at every size. Roboto Flex's optical size follows the font size automatically, and its width range opens up as the type gets bigger.

{{figure:opsz}}

At 14 px, \`wdth\` 75 takes 3.6% off the width. At 144 px it takes 20.3% off. A fit that works for a desktop headline can run out of axis on a phone.

Font size isn't linear either: doubling Roboto Flex from 36 to 72 px multiplied the width by 1.84, not 2. Roman Komarov saw the same thing in Fraunces when fitting with CSS: "the optical adjustment of the larger sizes makes the glyphs narrower, making the proportional increase not fill the lines fully."

## Fonts drawn for width

The exception is a font whose designer drew width as the point. In our sample Anybody reaches 68–132% over 75–125 and 37–163% over its full 50–150. Georama and Anek Latin are similar.

David Jonathan Ross's Fit is the clearest case outside the sample. He describes it as "designed with one thing in mind: filling up space with maximum impact", and says: "I drew Fit as a variable font with an expansive range of widths". We didn't measure Fit (it's a retail font), so we quote him and stop there.

If fitting by width is what your design needs, choosing a font like these does more than any script.

## What our library does with it

fitWidth searches the width axis first, at the font size you set, then closes what is left with letter-spacing, up to ±0.3em. We ran the built library on the same 21 fonts in Chromium: one headline ("Headline fitting", 72 px) and 16 targets from 0.5× to 2× its natural width, in steps of 0.1×.

{{figure:grid}}

| Strategy | Fits, of 336 |
|---|---|
| Width axis only | 75 |
| Tracking only, ±0.3em | 260 |
| Axis, then tracking (the default) | 286 |
| Axis, then font size 0.5–2×, then tracking ±0.05em | 336 |

Read these with three cautions. They describe this grid of targets, not headlines in general. The grid's range, 0.5× to 2×, is the same as the size option's range, which is why that row is complete. And the default's 286 fits include many nobody would ship: 167 of them needed more than 0.05em of letter-spacing, and 104 needed more than 0.12em, the top of the range Matthew Butterick gives for capitals.

Every status was checked against the rendered element afterwards: 1,344 checks, no disagreements.

## What tracking costs

Letter-spacing reaches far. It also changes the one thing the type designer set most carefully. Butterick's *Practical Typography* is plain about lowercase:

> Lowercase letters don’t ordinarily need letterspacing.

He adds that typographers "will often remove letterspacing from lowercase text used at larger sizes (e.g., headlines)". Capitals are different: "you always add 5–12% extra letterspacing to text in all caps or small caps." A fitting tool that adds 0.2em to a lowercase headline is working against that advice.

Two costs are mechanical, and we found both while testing.

**Ligatures switch off.** Browsers disable optional ligatures as soon as letter-spacing is not zero. In Advent Pro, "Headline fitting" at 72 px is 402.3 px wide at \`wdth\` 125; add 0.05 px of spacing and the "fi" splits, and the line jumps to 414.0 px. No tracking value lands on a target between the two.

**Our own fit was off, and a review found it.** Browsers add letter-spacing after the last letter as well as between letters. fitWidth 1.1.0 counted that trailing space as text. A tracked "fit" therefore ended with its last letter short of the box edge by the tracking amount, or past the edge when the tracking was negative. Across 457 tracked fits in the 21 fonts, the last letter ended between 20.4 px short and 19.0 px past the target, a median of 9.2 px off. The repository now counts spacing between letters only and cancels the trailing space with a margin: the same fits end 0 to 0.5 px inside the target. That fix is not on npm yet.

A third cost is visible in the demo. A narrow box makes the default fit with negative tracking, and at about −0.24em the letters run into each other. It fits by width and is unreadable.

## What CSS is doing

The platform is settling this from the other direction. The 2018 issue was closed on 28 April 2026, with Tab Atkins writing: "I'm going to close this issue as the core feature is done." The feature is \`text-fit\`, in the CSS Text Level 5 editor's draft. It scales the text.

\`\`\`
/* Scale each line up to fill its container, to at most double. */
h1 { text-fit: grow per-line-all 200%; }
\`\`\`

The width axis isn't in it. The Chrome team's explainer raises "\`font-weight\` or \`font-width\`" as possible fitting methods and answers, in a note in its source: "They work well only with specific fonts, and they don't offer the flexibility to fit text to any width. So we don't apply them in the initial proposal." Our numbers say the same thing with a figure attached. Komarov has listed other methods, variable axes among them, as something to keep room for.

We tested Chromium 149: \`text-fit\` is not supported by default, and with experimental web platform features turned on it took a 334.5 px headline to exactly 600 px. We didn't test Safari or Firefox. The same explainer says the feature "has not been approved to ship in Chrome".

Until it ships, a fluid font size gets close with no script:

\`\`\`
.card { container-type: inline-size; }
.card h1 { font-size: clamp(2rem, 11cqi, 6rem); }
\`\`\`

That scales with the container, not with the length of the text, so it doesn't land on the edge. Often that is all a design needs.

## The order we recommend

1. **Scale the text** if filling the box is the whole goal. Use \`text-fit\` when it ships, and fluid sizes or a size-fitting script until then. No width axis is needed.
2. **Pick a font drawn for width** if the look you want is letters that change shape to fill the line.
3. **Use the width axis for the last 10–20%**, when the size is fixed for a reason: a row of headlines that share a size, a baseline grid, a masthead.
4. **Let font size take over when the axis runs out**, within limits you set.
5. **Keep letter-spacing small**: none for lowercase if you can, a few hundredths of an em at most.

Steps 3 to 5 are what fitWidth's \`size\` option does:

\`\`\`
applyFitWidth(el, { size: true })
// axis first; font size 0.5× to 2× only if the axis can't reach;
// then at most ±0.05em of letter-spacing
\`\`\`

It also returns what each step did (the axis value, the font size, the tracking, the width each contributed and whether the text fits), which is where every number in the [demo](/#demo) comes from. \`size\` and the returned result are in the repository and run on fitwidth.com. They are not in npm 1.1.0, and \`size\` is off by default.

## Limits

- **Font size costs height.** A fitted headline that grows from 64 to 91 px is a taller line, and the layout below it moves. That's why \`size\` is opt-in and capped.
- **It isn't a superset of the default.** At its 0.5× floor the size order overflows a very narrow box that −0.3em of tracking squeezes into (illegibly). No order always wins.
- **Scaled text and accessibility.** Text that scales to fit can fail WCAG 1.4.4, Resize Text. Komarov has proposed that CSS default to "a default limit equal to 200% of the original font-size" for that reason; \`size: true\` stops at 2×.
- **The search range is a choice.** 75–125 is fitWidth's default, not a property of fonts. Roboto Flex reaches 83–120% over it and 49–140% over its full 25–151. The library can't read a font's own range, so you pass it. Over a full range the extremes are different designs, which is a reason to choose them on purpose.
- **Nothing forces a fit.** Past its ranges the library stops and leaves the text short or overflowing. An overflow prints a console warning; from the next release the result reports both.
- **One line.** fitWidth fits a single line and needs the font loaded first.

## Objections, answered

**"Type designers know a width range is narrow."** They do. What we add is the count, the measured reach, the size dependence and a fitting order. Developers reading the specification's "percentage" meet a different number in the browser.

**"Search the font's whole range, then."** You can, and for Roboto Flex or Anybody it helps a lot. For the 49 families that stop at 100 there is nothing more to search.

**"Google Fonts isn't the fonts I license."** True. This is a measurement of one open catalogue. We'd like the same numbers for retail families and don't have them.

**"Your own default tracks to 0.3em."** Yes. It has since 1.0, and changing a default changes existing sites, so the new order is opt-in for now. Whether it should become the default in a major version is an open question below.

**"Changing size breaks my hierarchy."** Sometimes. If the size is fixed for a reason, stay with the axis and accept that some boxes won't be filled. The result tells you by how much.

**"Just use text-fit."** If scaling is what you want, yes. That's recommendation 1.

## Open questions

- How do readers judge a headline fitted by width, by size and by tracking? We found no study, and ran none.
- What do retail width families reach? Fit suggests far more than the open catalogue.
- Should fitWidth's default change to the size order in a major version?
- Do Safari and Firefox clamp, shape and space the same way? Every browser number here is Chromium.
- Will \`text-fit\` grow a way to use a font's axes, as the working group has left room for?

## Method

- **Census.** \`fonts.google.com/metadata/fonts\`, fetched 7 October 2026, 10:44 UTC. A family counts as having a width axis when its metadata lists a \`wdth\` axis.
- **Fonts.** 21 upright variable TTFs from \`google/fonts\` at commit \`7085eb8\` (5 October 2026): Advent Pro, Anek Latin, Anybody, Archivo, Asap, Bricolage Grotesque, Encode Sans, Georama, IBM Plex Sans, Inconsolata, League Gothic, Merriweather, Mona Sans, Noto Sans, Nunito Sans, Open Sans, Roboto, Roboto Flex, Roboto Serif, Saira, Science Gothic.
- **Reach.** Five strings ("THE WIDTH AXIS", "Headline fitting", "Hamburgefonstiv", "Breaking News: Markets Rally", "MINIMUM") at \`wdth\` 75, 100 and 125, each clamped to the font's range; weight 400; 72 px with optical size automatic. Reach is the mean over the five strings of width ÷ width at \`wdth\` 100. Measured with HarfBuzz (uharfbuzz 0.56.1, advances) and in Chromium 149.0.7827.55 (\`getBoundingClientRect\`), which agreed within 0.10%.
- **Library.** fitWidth built from its repository at commit \`8b7123f6\` (the 1.2.0 candidate), and published 1.1.0 from npm for comparison, both loaded in Chromium 149. Fits: "Headline fitting", 72 px, targets = natural width × 0.5, 0.6 … 2.0. A fit is a measured width no wider than the target and at most 0.5 px narrower.
- **Not measured.** Safari, Firefox, retail fonts, italics, non-Latin text, and readers.

Scripts, outputs and the fetched source pages are kept with the talk's working files; the tables are on the [data page](/paper/data).

## Sources

- OpenType specification, \`wdth\` axis: [learn.microsoft.com](https://learn.microsoft.com/en-us/typography/opentype/spec/dvaraxistag_wdth)
- CSS Working Group issue 2528, "Feature for making text always fit the width of its parent", opened 11 April 2018, closed 28 April 2026: [github.com/w3c/csswg-drafts](https://github.com/w3c/csswg-drafts/issues/2528). Malkin, [11 April 2018](https://github.com/w3c/csswg-drafts/issues/2528#issuecomment-380541029); Constable, [2 May 2025](https://github.com/w3c/csswg-drafts/issues/2528#issuecomment-2847510536); Komarov, [1 October 2025](https://github.com/w3c/csswg-drafts/issues/2528#issuecomment-3356360458); Atkins, [28 April 2026](https://github.com/w3c/csswg-drafts/issues/2528#issuecomment-4336977663)
- CSS Text Module Level 5, editor's draft source, \`text-fit\`: [github.com/w3c/csswg-drafts](https://github.com/w3c/csswg-drafts/blob/main/css-text-5/Overview.bs) (read at the commit of 4 June 2026)
- Blink Layout Team, "CSS fit-width text Explainer", README at the commit of 19 March 2026: [github.com/explainers-by-googlers/css-fit-text](https://github.com/explainers-by-googlers/css-fit-text/blob/10ab4afa754de77696c902e2a0c64ee7b4db59c8/README.md). The sentence about \`font-width\` is inside an HTML comment in the file's source and doesn't show on the rendered page.
- Roman Komarov, "Text Fitting: Default scaling limit", CSSWG issue 12886, 1 October 2025: [github.com/w3c/csswg-drafts](https://github.com/w3c/csswg-drafts/issues/12886)
- Roman Komarov, "Fit-to-Width Text", July 2024: [kizu.dev/fit-to-width](https://kizu.dev/fit-to-width/)
- Matthew Butterick, *Practical Typography*, "Letterspacing": [practicaltypography.com](https://practicaltypography.com/letterspacing.html)
- David Jonathan Ross, Fit: [djr.com/fit](https://djr.com/fit)
- Google Fonts catalogue metadata: [fonts.google.com/metadata/fonts](https://fonts.google.com/metadata/fonts); font files: [github.com/google/fonts](https://github.com/google/fonts)
- Library READMEs, read 7 October 2026: [fitty](https://github.com/rikschennink/fitty), [textFit](https://github.com/STRML/textFit), [FitText.js](https://github.com/davatron5000/FitText.js), [BigText](https://github.com/zachleat/BigText)
- WCAG 2.1, Success Criterion 1.4.4 Resize Text: [w3.org](https://www.w3.org/TR/WCAG21/#resize-text)
`
