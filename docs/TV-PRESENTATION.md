# Present mode for an 80-inch display

Design target: a 16:9, 80-inch display viewed from approximately 6 m. This is a layout simulation and an editorial target. It is not verification in the actual meeting room.

Import `src/app/tv-presentation.css` after `globals.css`. The stylesheet applies automatically when the existing **Present** control adds `.is-present`, on landscape viewports at least 901 CSS pixels wide. Normal scrolling and the mobile layout retain their existing styles. Arabic remains the primary language, aligned to the right, with English immediately below it.

## Scale and physical size

An 80-inch 16:9 panel is approximately 1,771 × 996 mm. One viewport-width unit therefore represents approximately 17.71 mm on a full-screen display. The main scale is the same physical size at 3840 × 2160 CSS pixels and at 1920 × 1080 CSS pixels stretched across that panel. Small `rem` floors keep the layout usable at narrower widths; there is no fixed-pixel upper cap.

| Role | Arabic / English | At 1920 CSS px | At 3840 CSS px | Approximate physical em height |
| --- | --- | --- | --- | --- |
| Chapter title | 3.2vw / 1.7vw | 61 / 33 px | 123 / 65 px | 57 / 30 mm |
| Main statement | 2vw / 1.55vw | 38 / 30 px | 77 / 60 px | 35 / 27 mm |
| Short proof or programme data | 1.7vw / 1.35vw | 33 / 26 px | 65 / 52 px | 30 / 24 mm |
| Material qualifier | 1.4vw / 1.15vw | 27 / 22 px | 54 / 44 px | 25 / 20 mm |

These are CSS em dimensions, not measured glyph heights. Arabic forms and Latin x-height occupy only part of the em. The smaller qualifiers require particular attention in room testing. At 6 m, the 35 mm main Arabic em subtends approximately 20 arcminutes; that arithmetic alone does not establish comfortable reading.

The established fonts are retained: Aref Ruqaa Bold for Arabic display titles, IBM Plex Sans Arabic for Arabic body text, and IBM Plex Sans for English. The title, narrative, data and qualifier roles use consistent scale and leading. Arabic tracking remains zero. Both heading languages use balanced wrapping; paragraph text uses natural wrapping without line clamps.

## Editorial budget

Use one idea per chapter. For the main copy, aim for:

- Arabic title: 3–6 words; English title: 4–8 words. Prefer one line, accept two.
- Main statement: approximately 12 words per language, normally two or three short lines.
- At most one supporting point: approximately 8 English words and comparable Arabic length.
- A necessary qualifier: one short sentence in each language. A full explanation can be available through the visible assumptions/source controls.

Hero and location may use two short sentences. The city-value chapter can use three brief rows. The final decision chapter can use three compact phase columns. Avoid repeating a bilingual heading inside every row when the sentence already carries its meaning.

The masterplan's five selectable zones use a compact data scale. Retain the distinction between 37 ha in source labels and approximately 50.4 ha in the traced outline, and the need for a survey. Keep the 1,000-space target visibly qualified as a target. Source-map credits are attribution metadata, not the main argument.

## Optional semantic classes

The current selectors work with the existing DOM. These optional classes make future editorial intent explicit:

| Class | Intended use |
| --- | --- |
| `tv-lead` | Main bilingual statement; descendants marked `lang="ar"` and `lang="en"` receive the main scale. |
| `tv-proof` | One short supporting fact or programme point. |
| `tv-qualifier` | A material limitation or assumption that must remain visible. |
| `tv-secondary` | Only genuinely redundant decorative copy, intentionally omitted from Present mode. Never apply to material caveats, action labels or source status. |

Present mode omits the repeated eyebrow label. Its title carries the chapter's message. Existing short points remain available; the component should render the intended single point rather than relying on CSS to hide extra points.

The text column has no internal scroll pane, clipping, ellipsis, or line clamp. A chapter that exceeds the viewport remains visibly long and readable by page scrolling. Treat that as an editorial fit failure for a meeting slide, then shorten the copy without changing its meaning. Do not shrink audience-critical type to force a pass.

The CSS leaves Earth/Geography cameras, the eleven-chapter sequence, animation timings, reduced-motion logic and Masterplan stage geometry unchanged. Masterplan portal styles target stable IDs and data attributes, not generated CSS-module class names. The stylesheet uses existing theme tokens for dark and light modes.

## Validation boundary

Completed in this change: source inspection of existing typography and specificity, the initial Impeccable typography detector (no findings), PostCSS syntax parsing (80 rules, all scoped to `.experience.is-present`), and verification that the declared font weights exist in the self-hosted font manifest. Solid-background contrast calculations are 15.25:1 / 8.54:1 for dark Arabic/English body colors and 10.67:1 / 4.91:1 in light mode. These calculations do not verify text placed over rendered imagery. The detector did not identify the original fixed 12–16px presentation text as a viewing-distance problem; physical scale and actual content remain the primary criteria.

Integration checks completed: all eleven chapters passed the 3840 × 2160 DOM fit audit and 390 px horizontal-overflow audit; 1280 × 720 compositions and both themes were visually inspected. The updated plan, loaded v3 model, photo gallery and static fallback were also checked. See [revision 3 validation](validation.md). A full-resolution 4K raster screenshot was not reliable in the embedded browser compositor. The following remain the repeatable acceptance checklist, with actual venue testing still outstanding:

1. Inspect all eleven chapters at 1920 × 1080 and 3840 × 2160, with the final Arabic and English text, in both themes. Check the masterplan's five zones and the final phase columns.
2. Confirm that essential copy fits between header and dock without overlap or internal scrolling. Check open assumptions, keyboard focus and the source dialog separately.
3. Confirm mobile and normal scroll layouts remain unchanged, and verify pause/reduced-motion behavior in the integrated build.
4. Present full-screen on the actual 80-inch panel and read the longest chapter and smallest material qualifier from 6 m. Account for operating-system scale, browser chrome, overscan, room lighting and actual viewers. Record failures and shorten copy before reducing the role scale.

One distinct primary visual should support each chapter. Asset selection and repeated generated-image removal are content work; this CSS does not establish image uniqueness.
